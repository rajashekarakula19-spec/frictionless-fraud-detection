import numpy as np
import pytest
from src.models.cost_loss import CostSensitiveObjective
from src.models.threshold import CostUtilityOptimizer


class MockTrainData:
    def __init__(self, labels: np.ndarray):
        self.labels = labels
    def get_label(self):
        return self.labels


def test_cost_sensitive_objective_gradients():
    objective = CostSensitiveObjective(chargeback_fee=20.0, user_insult_cost=35.0, cost_ratio=4.0)
    labels = np.array([0, 1, 0, 1])
    preds = np.array([-2.0, -1.0, 1.5, 2.5])  # logits
    train_data = MockTrainData(labels)

    grad, hess = objective.lightgbm_objective(preds, train_data)

    assert len(grad) == 4
    assert len(hess) == 4
    # All hessians must be strictly positive for gradient boosting stability
    assert np.all(hess > 0)
    # The penalty for a False Negative (actual fraud labeled 1 with negative logit) should be positive and amplified
    assert grad[1] < 0  # pushes prediction higher towards positive class


def test_cost_utility_optimizer_curve():
    optimizer = CostUtilityOptimizer(chargeback_fee=20.0, user_insult_cost=35.0)

    y_true = np.array([0, 0, 0, 0, 1, 1, 0, 0, 1, 0])
    y_prob = np.array([0.02, 0.05, 0.1, 0.12, 0.88, 0.95, 0.04, 0.01, 0.75, 0.15])
    amounts = np.array([50, 120, 20, 80, 500, 1200, 45, 90, 300, 60])

    policy = optimizer.find_optimal_policy(y_true, y_prob, amounts)

    assert "optimal_threshold" in policy
    assert "theta_low" in policy
    assert "theta_high" in policy
    assert policy["max_net_savings"] > 0
    assert len(policy["cost_curve"]) > 10
