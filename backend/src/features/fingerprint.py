import numpy as np
import pandas as pd
from typing import Set


HIGH_RISK_DOMAINS: Set[str] = {
    "mailinator.com", "protonmail.com", "trashmail.net",
    "yopmail.com", "temp-mail.org", "anonymous.com", "guerrillamail.com"
}


def engineer_fingerprint_and_geo_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineers billing address discrepancy, geo-distance, device characteristics,
    and email domain verification features.
    """
    df = df.copy()

    # 1. Billing Address vs Geo Distance
    if "dist1" in df.columns:
        df["dist1_missing"] = df["dist1"].isna().astype(np.float32)
        df["dist1_clean"] = df["dist1"].fillna(-1).astype(np.float32)
        df["dist1_log"] = np.log1p(np.maximum(df["dist1"].fillna(0), 0)).astype(np.float32)
        # Extreme geo distance flag (>500 miles between billing & IP location)
        df["dist1_extreme_flag"] = (df["dist1"].fillna(0) > 500).astype(np.float32)
    else:
        df["dist1_missing"] = 1.0
        df["dist1_clean"] = -1.0
        df["dist1_log"] = 0.0
        df["dist1_extreme_flag"] = 0.0

    # 2. Email domain verification
    p_email = df["P_emaildomain"].fillna("missing").astype(str).str.lower()
    r_email = df["R_emaildomain"].fillna("missing").astype(str).str.lower()

    df["email_domains_match"] = ((p_email == r_email) & (p_email != "missing")).astype(np.float32)
    df["has_r_email"] = (r_email != "missing").astype(np.float32)
    df["is_high_risk_p_email"] = p_email.isin(HIGH_RISK_DOMAINS).astype(np.float32)
    df["is_high_risk_r_email"] = r_email.isin(HIGH_RISK_DOMAINS).astype(np.float32)

    # 3. Device category parsing
    device_type = df["DeviceType"].fillna("missing").astype(str).str.lower()
    df["is_mobile_device"] = (device_type == "mobile").astype(np.float32)
    df["is_desktop_device"] = (device_type == "desktop").astype(np.float32)
    df["device_missing"] = (device_type == "missing").astype(np.float32)

    device_info = df["DeviceInfo"].fillna("missing").astype(str).str.lower()
    df["is_suspicious_device_agent"] = device_info.str.contains("tor|emulator|bot|dalvik|generic", regex=True).astype(np.float32)

    # 4. Amount-level behavioral features
    df["amt_log"] = np.log1p(df["TransactionAmt"]).astype(np.float32)
    # Micro-authorization card testing flag ($1.00 - $4.00)
    df["is_micro_auth_probing"] = ((df["TransactionAmt"] >= 1.0) & (df["TransactionAmt"] <= 4.0)).astype(np.float32)
    # Check if amount is an exact round integer (often preferred by fraudulent cashouts)
    df["is_round_amt"] = (df["TransactionAmt"] % 1 == 0).astype(np.float32)

    return df
