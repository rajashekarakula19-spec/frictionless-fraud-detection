import numpy as np
import pandas as pd
from typing import Dict, Any, List
from collections import defaultdict, deque


class RealTimeVelocityEngine:
    """
    In-memory stateful streaming velocity engine for sub-5ms real-time scoring.
    Maintains time-decayed sliding deques of transactions per card entity.
    """
    def __init__(self):
        # card_id -> deque of (timestamp, amount)
        self.card_history: Dict[str, deque] = defaultdict(deque)
        # card_id -> deque of (timestamp, device_id)
        self.device_history: Dict[str, deque] = defaultdict(deque)

    def _prune(self, history: deque, current_time: float, max_window: float = 604800.0):
        cutoff = current_time - max_window
        while history and history[0][0] < cutoff:
            history.popleft()

    def update_and_compute(
        self,
        card_id: str,
        current_time: float,
        amount: float,
        device_id: str = "unknown"
    ) -> Dict[str, float]:
        """
        Updates sliding windows and returns engineered velocity features for a live transaction.
        """
        ch = self.card_history[card_id]
        dh = self.device_history[card_id]

        self._prune(ch, current_time, max_window=604800.0)
        self._prune(dh, current_time, max_window=86400.0)

        # 1. Inter-arrival time (time since last tx)
        time_since_last_tx = (current_time - ch[-1][0]) if ch else 86400.0

        # 2. Velocity counts & sums across 1h, 6h, 24h, 7d
        c_1h = 0
        s_1h = 0.0
        c_6h = 0
        c_24h = 0
        s_24h = 0.0
        c_7d = len(ch)

        t_1h = current_time - 3600.0
        t_6h = current_time - 21600.0
        t_24h = current_time - 86400.0

        for t, amt in reversed(ch):
            if t >= t_1h:
                c_1h += 1
                s_1h += amt
            if t >= t_6h:
                c_6h += 1
            if t >= t_24h:
                c_24h += 1
                s_24h += amt

        mean_amt_24h = (s_24h / c_24h) if c_24h > 0 else amount
        amt_ratio_24h = amount / (mean_amt_24h + 1e-4)

        # 3. Device fingerprint switches in last 24h
        recent_devices = {dev for t, dev in dh if t >= t_24h}
        device_switch_24h = 1 if (len(recent_devices) > 0 and device_id not in recent_devices) else 0
        unique_devices_24h = len(recent_devices | {device_id})

        # Append current transaction to state
        ch.append((current_time, amount))
        dh.append((current_time, device_id))

        return {
            "tx_count_1h": float(c_1h),
            "tx_amt_sum_1h": float(s_1h),
            "tx_count_6h": float(c_6h),
            "tx_count_24h": float(c_24h),
            "tx_amt_sum_24h": float(s_24h),
            "tx_amt_ratio_to_mean_24h": float(amt_ratio_24h),
            "tx_count_7d": float(c_7d),
            "time_since_last_tx": float(time_since_last_tx),
            "device_switch_24h": float(device_switch_24h),
            "unique_devices_24h": float(unique_devices_24h),
        }


def engineer_batch_velocity_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes cross-session sliding window velocities on historical batch data.
    Preserves strict temporal causality (only past events are counted).
    """
    df = df.copy()
    if "TransactionDT" not in df.columns:
        df["TransactionDT"] = np.arange(len(df)) * 60

    # Create unified card identifier
    df["card_uid"] = (
        df["card1"].astype(str) + "_" +
        df["card2"].fillna(-1).astype(str) + "_" +
        df["card4"].fillna("na").astype(str)
    )

    df = df.sort_values("TransactionDT").reset_index(drop=True)

    # Initialize feature arrays
    n = len(df)
    tx_count_1h = np.zeros(n, dtype=np.float32)
    tx_amt_sum_1h = np.zeros(n, dtype=np.float32)
    tx_count_6h = np.zeros(n, dtype=np.float32)
    tx_count_24h = np.zeros(n, dtype=np.float32)
    tx_amt_sum_24h = np.zeros(n, dtype=np.float32)
    tx_amt_ratio_24h = np.zeros(n, dtype=np.float32)
    tx_count_7d = np.zeros(n, dtype=np.float32)
    time_since_last_tx = np.zeros(n, dtype=np.float32)
    device_switch_24h = np.zeros(n, dtype=np.float32)
    unique_devices_24h = np.zeros(n, dtype=np.float32)

    engine = RealTimeVelocityEngine()

    card_uids = df["card_uid"].values
    dts = df["TransactionDT"].values
    amts = df["TransactionAmt"].values
    devices = df["DeviceInfo"].fillna("unknown").astype(str).values

    for i in range(n):
        feats = engine.update_and_compute(
            card_id=card_uids[i],
            current_time=float(dts[i]),
            amount=float(amts[i]),
            device_id=devices[i]
        )
        tx_count_1h[i] = feats["tx_count_1h"]
        tx_amt_sum_1h[i] = feats["tx_amt_sum_1h"]
        tx_count_6h[i] = feats["tx_count_6h"]
        tx_count_24h[i] = feats["tx_count_24h"]
        tx_amt_sum_24h[i] = feats["tx_amt_sum_24h"]
        tx_amt_ratio_24h[i] = feats["tx_amt_ratio_to_mean_24h"]
        tx_count_7d[i] = feats["tx_count_7d"]
        time_since_last_tx[i] = feats["time_since_last_tx"]
        device_switch_24h[i] = feats["device_switch_24h"]
        unique_devices_24h[i] = feats["unique_devices_24h"]

    df["tx_count_1h"] = tx_count_1h
    df["tx_amt_sum_1h"] = tx_amt_sum_1h
    df["tx_count_6h"] = tx_count_6h
    df["tx_count_24h"] = tx_count_24h
    df["tx_amt_sum_24h"] = tx_amt_sum_24h
    df["tx_amt_ratio_to_mean_24h"] = tx_amt_ratio_24h
    df["tx_count_7d"] = tx_count_7d
    df["time_since_last_tx"] = time_since_last_tx
    df["device_switch_24h"] = device_switch_24h
    df["unique_devices_24h"] = unique_devices_24h

    return df
