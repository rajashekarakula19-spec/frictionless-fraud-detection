import os
import pickle
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.metrics import roc_auc_score, average_precision_score
from typing import Dict, Any, Tuple

from src.data.loader import load_dataset
from src.features.velocity import engineer_batch_velocity_features
from src.features.fingerprint import engineer_fingerprint_and_geo_features
from src.models.cost_loss import CostSensitiveObjective
from src.models.threshold import CostUtilityOptimizer


FEATURE_COLUMNS = [
    # Velocity Features
    "tx_count_1h", "tx_amt_sum_1h", "tx_count_6h", "tx_count_24h",
    "tx_amt_sum_24h", "tx_amt_ratio_to_mean_24h", "tx_count_7d",
    "time_since_last_tx", "device_switch_24h", "unique_devices_24h",
    # Fingerprint, Geo & Identity
    "dist1_clean", "dist1_missing", "dist1_log", "dist1_extreme_flag",
    "email_domains_match", "has_r_email", "is_high_risk_p_email", "is_high_risk_r_email",
    "is_mobile_device", "is_desktop_device", "is_suspicious_device_agent",
    # Amount & Transaction characteristics
    "TransactionAmt", "amt_log", "is_micro_auth_probing", "is_round_amt",
    # IEEE-CIS Cards & Counters
    "card1", "card2", "card3", "card5", "addr1", "addr2",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3",
    "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"
]


def prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray, np.ndarray]:
    """
    Applies full feature engineering pipeline: velocity + fingerprint + identity.
    """
    df = engineer_batch_velocity_features(df)
    df = engineer_fingerprint_and_geo_features(df)

    # Fill remaining missing numeric features with -1 or median
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = -1.0
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(-1.0)

    X = df[FEATURE_COLUMNS].copy()
    y = df["isFraud"].values if "isFraud" in df.columns else np.zeros(len(df))
    amounts = df["TransactionAmt"].values

    return X, y, amounts


def train_fraud_model(
    data_dir: str = "data",
    sample_size: int = 40000,
    save_path: str = "models/fraud_model.pkl"
) -> Dict[str, Any]:
    """
    Executes full production training lifecycle:
    1. Chronological data split (train / test)
    2. Velocity & Identity feature engineering
    3. Cost-sensitive LightGBM training with custom loss
    4. ROC-AUC, PR-AUC & Expected Monetary Utility threshold optimization
    5. Artifact serialization
    """
    print(f"Loading data (sample_size={sample_size})...")
    train_df, test_df = load_dataset(data_dir=data_dir, sample_size=sample_size, test_ratio=0.25)

    print("Engineering features on training split...")
    X_train, y_train, amounts_train = prepare_features(train_df)
    print("Engineering features on test split...")
    X_test, y_test, amounts_test = prepare_features(test_df)

    cost_obj = CostSensitiveObjective(chargeback_fee=20.0, user_insult_cost=35.0, cost_ratio=4.5)

    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

    params = {
        "boosting_type": "gbdt",
        "objective": cost_obj.lightgbm_objective,
        "learning_rate": 0.05,
        "num_leaves": 31,
        "max_depth": 6,
        "feature_fraction": 0.85,
        "bagging_fraction": 0.85,
        "bagging_freq": 1,
        "verbose": -1,
        "n_jobs": 4,
        "random_state": 42
    }

    print("Training Cost-Sensitive LightGBM model...")
    # Train using custom cost objective
    model = lgb.train(
        params,
        train_data,
        num_boost_round=120,
        valid_sets=[train_data, val_data],
        feval=cost_obj.cost_eval_metric,
        callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)]
    )

    # Predict test probabilities
    # Note: custom objective outputs raw margins, convert with sigmoid
    raw_preds = model.predict(X_test, raw_score=True)
    y_prob = 1.0 / (1.0 + np.exp(-raw_preds))

    roc_auc = roc_auc_score(y_test, y_prob)
    pr_auc = average_precision_score(y_test, y_prob)

    print(f"Model Evaluation -> ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}")

    # Optimize Cost Curve & Operational Thresholds
    print("Optimizing Cost Curve & Decision Policy...")
    optimizer = CostUtilityOptimizer(chargeback_fee=20.0, user_insult_cost=35.0, target_max_fpr=0.005)
    policy = optimizer.find_optimal_policy(y_test, y_prob, amounts_test)

    # Feature Importance
    importance_df = pd.DataFrame({
        "feature": FEATURE_COLUMNS,
        "importance": model.feature_importance(importance_type="gain")
    }).sort_values("importance", ascending=False)

    print("Top 8 Fraud Drivers:")
    print(importance_df.head(8).to_string(index=False))

    artifact = {
        "model": model,
        "features": FEATURE_COLUMNS,
        "policy": policy,
        "metrics": {
            "roc_auc": round(float(roc_auc), 4),
            "pr_auc": round(float(pr_auc), 4),
            "test_sample_size": len(y_test),
            "fraud_rate": round(float(np.mean(y_test) * 100), 2),
            "net_savings_dollars": policy["max_net_savings"],
            "user_insult_rate_pct": policy["operating_user_insult_rate_pct"],
            "fraud_recall_pct": policy["operating_fraud_recall_pct"]
        },
        "top_features": importance_df.head(15).to_dict(orient="records")
    }

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as f:
        pickle.dump(artifact, f)

    print(f"Artifact successfully saved to {save_path}")
    return artifact


if __name__ == "__main__":
    train_fraud_model()
