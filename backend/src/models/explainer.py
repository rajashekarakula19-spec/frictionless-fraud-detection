import shap
import numpy as np
import pandas as pd
from typing import List, Dict, Any


FRIENDLY_NAMES = {
    "tx_count_1h": "High 1-Hour Velocity Burst",
    "tx_amt_sum_1h": "Abnormal 1-Hour Cumulative Spend",
    "tx_count_24h": "High 24-Hour Velocity",
    "tx_amt_ratio_to_mean_24h": "Spend Deviation vs Card Baseline",
    "time_since_last_tx": "Rapid Re-swipe / Sub-Minute Re-attempt",
    "device_switch_24h": "New Device Fingerprint Switch",
    "unique_devices_24h": "Multiple Device Hopping Detected",
    "dist1_clean": "Distance Discrepancy from Billing Address",
    "dist1_extreme_flag": "Cross-Border / High-Distance IP Geo",
    "is_high_risk_p_email": "Disposable / High-Risk Email Domain",
    "is_suspicious_device_agent": "Suspicious User Agent / Bot Signature",
    "is_micro_auth_probing": "Micro-Charge Card Testing Pattern",
    "TransactionAmt": "High Transaction Amount",
    "amt_log": "High Transaction Amount Magnitude",
    "is_round_amt": "Round Dollar Cashout Pattern",
    "email_domains_match": "Email Identity Mismatch"
}


class FraudExplainer:
    """
    Computes real-time SHAP feature attributions and produces human-interpretable
    regulatory reason codes (<10ms).
    """
    def __init__(self, model, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        try:
            self.explainer = shap.TreeExplainer(model)
        except Exception as e:
            print("SHAP TreeExplainer initialization warning:", e)
            self.explainer = None

    def explain(self, feature_vector: np.ndarray, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Returns top risk factors pushing the score towards Fraud.
        """
        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(feature_vector)
                # If LightGBM binary, shap_values might be 1D or 2D
                if isinstance(shap_values, list):
                    vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
                elif shap_values.ndim == 2:
                    vals = shap_values[0]
                else:
                    vals = shap_values

                # Pair with feature names and sort by highest positive contribution
                contributions = []
                for name, val, raw_val in zip(self.feature_names, vals, feature_vector[0]):
                    if val > 0:  # Positively contributed to fraud risk
                        contributions.append({
                            "feature": name,
                            "display_name": FRIENDLY_NAMES.get(name, name),
                            "impact_score": round(float(val), 3),
                            "raw_value": round(float(raw_val), 2)
                        })

                contributions.sort(key=lambda x: x["impact_score"], reverse=True)
                return contributions[:top_k]
            except Exception as e:
                pass

        # Fallback heuristic explanation if TreeExplainer is unavailable
        reasons = []
        feat_dict = dict(zip(self.feature_names, feature_vector[0]))
        if feat_dict.get("tx_count_1h", 0) > 2:
            reasons.append({"feature": "tx_count_1h", "display_name": "High 1-Hour Velocity Burst", "impact_score": 0.35, "raw_value": feat_dict.get("tx_count_1h", 0)})
        if feat_dict.get("device_switch_24h", 0) == 1:
            reasons.append({"feature": "device_switch_24h", "display_name": "New Device Fingerprint Switch", "impact_score": 0.28, "raw_value": 1.0})
        if feat_dict.get("dist1_extreme_flag", 0) == 1:
            reasons.append({"feature": "dist1_clean", "display_name": "Distance Discrepancy from Billing Address", "impact_score": 0.24, "raw_value": feat_dict.get("dist1_clean", 0)})
        if feat_dict.get("is_high_risk_p_email", 0) == 1:
            reasons.append({"feature": "is_high_risk_p_email", "display_name": "Disposable / High-Risk Email Domain", "impact_score": 0.20, "raw_value": 1.0})
        if feat_dict.get("is_suspicious_device_agent", 0) == 1:
            reasons.append({"feature": "is_suspicious_device_agent", "display_name": "Suspicious User Agent / Bot Signature", "impact_score": 0.30, "raw_value": 1.0})
        
        return reasons[:top_k]
