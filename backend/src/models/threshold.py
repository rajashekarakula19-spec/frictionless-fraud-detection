import numpy as np
import pandas as pd
from typing import Dict, Any, List


class CostUtilityOptimizer:
    """
    Finds financially optimal operating thresholds by evaluating expected
    chargeback loss vs. legitimate customer insult friction.
    """
    def __init__(
        self,
        chargeback_fee: float = 20.0,
        user_insult_cost: float = 35.0,
        step_up_cost: float = 0.15,
        target_max_fpr: float = 0.005  # Max 0.5% insult rate on clean users
    ):
        self.chargeback_fee = chargeback_fee
        self.user_insult_cost = user_insult_cost
        self.step_up_cost = step_up_cost
        self.target_max_fpr = target_max_fpr

    def compute_cost_curve(
        self,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        amounts: np.ndarray,
        threshold_steps: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Calculates financial and operational metrics across the full threshold spectrum [0.01, 0.99].
        """
        thresholds = np.linspace(0.01, 0.99, threshold_steps)
        curve_data = []

        total_tx = len(y_true)
        total_fraud_count = np.sum(y_true == 1)
        total_clean_count = np.sum(y_true == 0)
        total_baseline_chargeback_loss = np.sum((y_true == 1) * (amounts + self.chargeback_fee))

        for th in thresholds:
            y_pred = (y_prob >= th).astype(int)

            tp_mask = (y_true == 1) & (y_pred == 1)
            fn_mask = (y_true == 1) & (y_pred == 0)
            fp_mask = (y_true == 0) & (y_pred == 1)
            tn_mask = (y_true == 0) & (y_pred == 0)

            tp = np.sum(tp_mask)
            fn = np.sum(fn_mask)
            fp = np.sum(fp_mask)
            tn = np.sum(tn_mask)

            # Monetary costs
            chargeback_loss = np.sum(fn_mask * (amounts + self.chargeback_fee))
            user_insult_cost = fp * self.user_insult_cost
            total_cost = chargeback_loss + user_insult_cost
            net_savings = total_baseline_chargeback_loss - total_cost

            # Operational rates
            recall = tp / total_fraud_count if total_fraud_count > 0 else 0.0
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            user_insult_rate = fp / total_clean_count if total_clean_count > 0 else 0.0
            approval_rate = (tn + fn) / total_tx if total_tx > 0 else 0.0
            chargeback_ratio = fn / (tn + fn) if (tn + fn) > 0 else 0.0

            curve_data.append({
                "threshold": round(float(th), 3),
                "total_cost": round(float(total_cost), 2),
                "chargeback_loss": round(float(chargeback_loss), 2),
                "user_insult_cost": round(float(user_insult_cost), 2),
                "net_savings": round(float(net_savings), 2),
                "user_insult_rate": round(float(user_insult_rate * 100), 3),
                "recall": round(float(recall * 100), 2),
                "precision": round(float(precision * 100), 2),
                "approval_rate": round(float(approval_rate * 100), 2),
                "chargeback_ratio_pct": round(float(chargeback_ratio * 100), 3),
                "tp": int(tp),
                "fp": int(fp),
                "fn": int(fn),
                "tn": int(tn)
            })

        return curve_data

    def find_optimal_policy(
        self,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        amounts: np.ndarray
    ) -> Dict[str, Any]:
        """
        Determines:
        1. Single optimal threshold minimizing total dollar loss.
        2. Multi-tier thresholds (theta_low for frictionless auto-approval, theta_high for auto-decline).
        """
        curve = self.compute_cost_curve(y_true, y_prob, amounts, threshold_steps=120)

        # 1. Optimal threshold minimizing total financial loss
        best_point = min(curve, key=lambda x: x["total_cost"])
        optimal_threshold = best_point["threshold"]

        # 2. Theta_low: highest threshold where user insult rate <= target_max_fpr (e.g. 0.4%)
        low_candidates = [p for p in curve if p["user_insult_rate"] <= (self.target_max_fpr * 100)]
        theta_low = low_candidates[0]["threshold"] if low_candidates else 0.15

        # 3. Theta_high: threshold where precision reaches high certainty (e.g. >= 80%)
        high_candidates = [p for p in curve if p["precision"] >= 80.0 and p["threshold"] > theta_low]
        theta_high = high_candidates[0]["threshold"] if high_candidates else max(optimal_threshold, 0.70)

        baseline_loss = float(np.sum((y_true == 1) * (amounts + self.chargeback_fee)))

        return {
            "optimal_threshold": optimal_threshold,
            "theta_low": round(float(theta_low), 3),
            "theta_high": round(float(theta_high), 3),
            "baseline_unmitigated_loss": round(baseline_loss, 2),
            "optimized_total_loss": best_point["total_cost"],
            "max_net_savings": best_point["net_savings"],
            "operating_user_insult_rate_pct": best_point["user_insult_rate"],
            "operating_fraud_recall_pct": best_point["recall"],
            "cost_curve": curve
        }
