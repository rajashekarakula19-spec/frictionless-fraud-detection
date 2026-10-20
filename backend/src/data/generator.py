import numpy as np
import pandas as pd


def generate_benchmark_data(n_samples: int = 50000, fraud_rate: float = 0.035, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic e-commerce transaction dataset matching the IEEE-CIS
    Fraud Detection schema and characteristics:
    - ~3.5% base fraud rate with authentic behavioral patterns:
      * Velocity bursts (card testing, automated bots)
      * Device fingerprint switching (emulator/device hopping)
      * Cross-border / Billing address vs IP discrepancy
      * High-risk email domain patterns
      * Extreme amount anomalies vs micro-authorization probing
    """
    rng = np.random.RandomState(random_state)
    
    # Generate TransactionIDs and chronological TransactionDT (over 90 days)
    transaction_ids = np.arange(3000000, 3000000 + n_samples)
    dt_increments = rng.exponential(scale=120, size=n_samples)  # average 2 mins between tx
    transaction_dts = np.cumsum(dt_increments).astype(int)

    # Cards pool (represents customer accounts)
    n_cards = int(n_samples * 0.35)
    card1_pool = rng.randint(1000, 20000, size=n_cards)
    card2_pool = rng.choice([111, 222, 333, 444, 555, np.nan], size=n_cards, p=[0.25, 0.25, 0.2, 0.15, 0.1, 0.05])
    card3_pool = rng.choice([150, 185, 106, np.nan], size=n_cards, p=[0.85, 0.08, 0.05, 0.02])
    card4_pool = rng.choice(['visa', 'mastercard', 'discover', 'american express'], size=n_cards, p=[0.65, 0.28, 0.05, 0.02])
    card6_pool = rng.choice(['debit', 'credit'], size=n_cards, p=[0.75, 0.25])
    addr1_pool = rng.choice([126, 299, 315, 325, 441, 476, np.nan], size=n_cards, p=[0.2, 0.2, 0.2, 0.15, 0.15, 0.05, 0.05])
    addr2_pool = rng.choice([87, 60, 96, np.nan], size=n_cards, p=[0.9, 0.05, 0.03, 0.02])

    card_indices = rng.choice(n_cards, size=n_samples)
    
    # Initial fraudulent card assignment (some cards compromised)
    compromised_cards = set(rng.choice(n_cards, size=int(n_cards * 0.06), replace=False))

    # Base amounts (Lognormal with typical e-commerce median ~$65)
    base_amounts = np.exp(rng.normal(3.8, 1.1, size=n_samples))
    base_amounts = np.round(np.clip(base_amounts, 1.0, 4500.0), 2)

    # Email domains
    clean_emails = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'company.com']
    fraud_emails = ['protonmail.com', 'mailinator.com', 'trashmail.net', 'yopmail.com', 'temp-mail.org']
    
    # Devices
    clean_devices = ['iOS Device', 'Windows', 'MacOS', 'SM-G960F', 'Pixel 6', 'SM-A526B']
    fraud_devices = ['Linux/TorBrowser', 'Emulator-x86', 'Dalvik/2.1.0', 'Generic-Bot', 'Unknown-Agent']

    # Initialize columns
    is_fraud = np.zeros(n_samples, dtype=int)
    p_emails = []
    r_emails = []
    device_types = []
    device_infos = []
    dist1_vals = []
    dist2_vals = []
    product_cds = rng.choice(['W', 'H', 'C', 'S', 'R'], size=n_samples, p=[0.74, 0.06, 0.11, 0.02, 0.07])

    for i in range(n_samples):
        c_idx = card_indices[i]
        is_comp = c_idx in compromised_cards

        # Fraud probability determination
        p_fraud_event = 0.55 if is_comp else 0.008
        is_fr = 1 if rng.rand() < p_fraud_event else 0
        is_fraud[i] = is_fr

        if is_fr:
            # Fraud characteristics
            # 1. Extreme amounts: either bot micro-probe ($1.50 - $4.00) or high ticket cashout ($450 - $2200)
            if rng.rand() < 0.35:
                base_amounts[i] = round(rng.uniform(1.0, 5.0), 2)
            elif rng.rand() < 0.4:
                base_amounts[i] = round(rng.uniform(400.0, 2400.0), 2)
            
            # 2. Suspicious email domain
            if rng.rand() < 0.45:
                p_emails.append(rng.choice(fraud_emails))
                r_emails.append(rng.choice(fraud_emails))
            else:
                p_emails.append(rng.choice(clean_emails))
                r_emails.append(rng.choice(clean_emails) if rng.rand() < 0.6 else np.nan)

            # 3. Device hopping or suspicious user agents
            if rng.rand() < 0.5:
                device_types.append(rng.choice(['desktop', 'mobile']))
                device_infos.append(rng.choice(fraud_devices))
            else:
                device_types.append(rng.choice(['desktop', 'mobile']))
                device_infos.append(rng.choice(clean_devices))

            # 4. Large geo distance / cross-country mismatch
            dist1_vals.append(rng.uniform(300, 4500) if rng.rand() < 0.75 else np.nan)
            dist2_vals.append(rng.uniform(500, 6000) if rng.rand() < 0.4 else np.nan)
        else:
            # Clean customer characteristics
            p_emails.append(rng.choice(clean_emails))
            r_emails.append(rng.choice(clean_emails) if rng.rand() < 0.25 else np.nan)
            
            if rng.rand() < 0.8:
                device_types.append(rng.choice(['desktop', 'mobile']))
                device_infos.append(rng.choice(clean_devices))
            else:
                device_types.append(np.nan)
                device_infos.append(np.nan)

            dist1_vals.append(rng.uniform(0, 45) if rng.rand() < 0.35 else np.nan)
            dist2_vals.append(np.nan)

    # Build DataFrame
    df = pd.DataFrame({
        "TransactionID": transaction_ids,
        "isFraud": is_fraud,
        "TransactionDT": transaction_dts,
        "TransactionAmt": base_amounts,
        "ProductCD": product_cds,
        "card1": card1_pool[card_indices],
        "card2": card2_pool[card_indices],
        "card3": card3_pool[card_indices],
        "card4": card4_pool[card_indices],
        "card5": rng.choice([226, 166, 117, 102], size=n_samples),
        "card6": card6_pool[card_indices],
        "addr1": addr1_pool[card_indices],
        "addr2": addr2_pool[card_indices],
        "dist1": dist1_vals,
        "dist2": dist2_vals,
        "P_emaildomain": p_emails,
        "R_emaildomain": r_emails,
        "DeviceType": device_types,
        "DeviceInfo": device_infos,
    })

    # Add core IEEE-CIS counting & delta columns (C1-C5, D1-D3, V1-V10)
    for c_i in range(1, 6):
        df[f"C{c_i}"] = np.where(df["isFraud"] == 1, rng.poisson(lam=4.5, size=n_samples), rng.poisson(lam=1.1, size=n_samples))
    for d_i in range(1, 4):
        df[f"D{d_i}"] = np.where(df["isFraud"] == 1, rng.exponential(scale=5, size=n_samples), rng.exponential(scale=60, size=n_samples))
    for v_i in range(1, 11):
        df[f"V{v_i}"] = np.where(df["isFraud"] == 1, rng.normal(2.5, 1.2, size=n_samples), rng.normal(0.2, 0.8, size=n_samples))

    return df


if __name__ == "__main__":
    df = generate_benchmark_data(1000)
    print("Benchmark data generated successfully. Shape:", df.shape)
    print("Fraud distribution:\n", df["isFraud"].value_counts(normalize=True))
