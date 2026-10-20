import pytest
from src.features.velocity import RealTimeVelocityEngine


def test_velocity_engine_sliding_window():
    engine = RealTimeVelocityEngine()
    card_id = "test_card_123"

    # Transaction 1 at t=0
    f1 = engine.update_and_compute(card_id=card_id, current_time=0.0, amount=100.0, device_id="dev_mac")
    assert f1["tx_count_1h"] == 0
    assert f1["tx_count_24h"] == 0
    assert f1["time_since_last_tx"] == 86400.0
    assert f1["device_switch_24h"] == 0

    # Transaction 2 at t=600s (10 min later)
    f2 = engine.update_and_compute(card_id=card_id, current_time=600.0, amount=50.0, device_id="dev_mac")
    assert f2["tx_count_1h"] == 1
    assert f2["tx_amt_sum_1h"] == 100.0
    assert f2["tx_count_24h"] == 1
    assert f2["time_since_last_tx"] == 600.0
    assert f2["device_switch_24h"] == 0

    # Transaction 3 at t=1200s with a NEW device fingerprint (device hopping!)
    f3 = engine.update_and_compute(card_id=card_id, current_time=1200.0, amount=250.0, device_id="dev_tor")
    assert f3["tx_count_1h"] == 2
    assert f3["tx_count_24h"] == 2
    assert f3["device_switch_24h"] == 1.0
    assert f3["unique_devices_24h"] == 2.0


def test_velocity_engine_time_decay():
    engine = RealTimeVelocityEngine()
    card_id = "test_card_456"

    # Transaction 1 at t=0
    engine.update_and_compute(card_id=card_id, current_time=0.0, amount=100.0, device_id="dev_1")

    # Transaction 2 at t=4000s (> 1 hour later, so 1h count resets to 0, but 24h count is 1)
    f2 = engine.update_and_compute(card_id=card_id, current_time=4000.0, amount=50.0, device_id="dev_1")
    assert f2["tx_count_1h"] == 0
    assert f2["tx_count_24h"] == 1
    assert f2["tx_amt_sum_24h"] == 100.0
