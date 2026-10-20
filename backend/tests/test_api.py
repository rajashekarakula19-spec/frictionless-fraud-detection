import pytest
from fastapi.testclient import TestClient
from src.api.server import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_version" in data


def test_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "policy" in data


def test_cost_curve_endpoint(client):
    response = client.get("/api/cost-curve")
    assert response.status_code == 200
    data = response.json()
    assert "cost_curve" in data
    assert len(data["cost_curve"]) > 10


def test_score_clean_transaction(client):
    payload = {
        "amount": 42.50,
        "card_id": "card_clean_9981",
        "device_id": "dev_trusted_mac",
        "email": "sarah.smith@gmail.com",
        "distance_miles": 4.5,
        "device_type": "desktop",
        "is_suspicious_device": False
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] in ["APPROVE", "STEP_UP_CHALLENGE", "DECLINE"]
    assert res["latency_ms"] < 100.0  # verifies sub-100ms response SLA


def test_score_adversarial_attack_transaction(client):
    payload = {
        "amount": 1950.00,
        "card_id": "card_stolen_3301",
        "device_id": "dev_tor_node_882",
        "email": "card_stealer@mailinator.com",
        "distance_miles": 5400.0,
        "device_type": "desktop",
        "is_suspicious_device": True
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    res = response.json()
    # High risk attack should either trigger STEP_UP_CHALLENGE or DECLINE
    assert res["decision"] in ["STEP_UP_CHALLENGE", "DECLINE"]
    assert res["risk_score"] > 30.0
