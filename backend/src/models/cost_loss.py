import numpy as np
from typing import Tuple, Optional


class CostSensitiveObjective:
    """
    Custom Asymmetric Cost Loss for LightGBM and XGBoost.
    
    Balances:
      - Chargeback Loss (False Negative): Transaction Amount + Chargeback processing fee ($20)
      - User Insult Cost (False Positive): Customer churn & manual review friction ($35)
    """
    def __init__(self, chargeback_fee: float = 20.0, user_insult_cost: float = 35.0, cost_ratio: float = 4.5):
        self.chargeback_fee = chargeback_fee
        self.user_insult_cost = user_insult_cost
        self.cost_ratio = cost_ratio  # Relative penalty multiplier for missed fraud vs insult

    def lightgbm_objective(self, preds: np.ndarray, train_data) -> Tuple[np.ndarray, np.ndarray]:
        """
        LightGBM custom objective returning (gradient, hessian).
        preds: raw margin scores (logits).
        """
        labels = train_data.get_label()
        # Sigmoid activation to get probabilities
        p = 1.0 / (1.0 + np.exp(-preds))
        p = np.clip(p, 1e-15, 1.0 - 1e-15)

        # Asymmetric weights: Higher penalty on False Negatives (actual fraud predicted clean)
        # w_1 corresponds to positive fraud weight; w_0 corresponds to negative clean weight
        w_1 = self.cost_ratio
        w_0 = 1.0

        weights = np.where(labels == 1, w_1, w_0)

        # Gradient: dL/dz = weights * (p - labels)
        grad = weights * (p - labels)
        # Hessian: d^2L/dz^2 = weights * p * (1 - p)
        hess = weights * p * (1.0 - p)
        hess = np.maximum(hess, 1e-6)

        return grad, hess

    def xgboost_objective(self, preds: np.ndarray, dtrain) -> Tuple[np.ndarray, np.ndarray]:
        """
        XGBoost custom objective returning (gradient, hessian).
        """
        labels = dtrain.get_label()
        p = 1.0 / (1.0 + np.exp(-preds))
        p = np.clip(p, 1e-15, 1.0 - 1e-15)

        w_1 = self.cost_ratio
        w_0 = 1.0
        weights = np.where(labels == 1, w_1, w_0)

        grad = weights * (p - labels)
        hess = weights * p * (1.0 - p)
        hess = np.maximum(hess, 1e-6)

        return grad, hess

    def cost_eval_metric(self, preds: np.ndarray, train_data) -> Tuple[str, float, bool]:
        """
        Custom evaluation metric for LightGBM monitoring total dollar loss.
        Lower is better (is_higher_better = False).
        """
        labels = train_data.get_label()
        p = 1.0 / (1.0 + np.exp(-preds))
        # Standard threshold 0.5 for eval
        y_pred = (p >= 0.5).astype(int)

        fn = np.sum((labels == 1) & (y_pred == 0))
        fp = np.sum((labels == 0) & (y_pred == 1))

        total_cost = (fn * (100.0 + self.chargeback_fee)) + (fp * self.user_insult_cost)
        return "monetary_loss", total_cost, False
