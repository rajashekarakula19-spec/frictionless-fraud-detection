import os
import time
import pickle
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.features.velocity import RealTimeVelocityEngine
from src.features.fingerprint import HIGH_RISK_DOMAINS
from src.models.explainer import FraudExplainer
from src.models.trainer import FEATURE_COLUMNS, train_fraud_model


app = FastAPI(
    title="FraudSentinel - Real-Time Frictionless Fraud Detection API",
    description="Enterprise-grade cost-sensitive fraud scoring with sub-30ms latency and 3DS liability shift optimization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/fraud_model.pkl"
artifact: Optional[Dict[str, Any]] = None
velocity_engine = RealTimeVelocityEngine()
explainer: Optional[FraudExplainer] = None
start_time = time.time()


def ensure_model_loaded():
    global artifact, explainer
    if artifact is None:
        if not os.path.exists(MODEL_PATH):
            print("Model artifact not found. Training initial model...")
            artifact = train_fraud_model(sample_size=30000, save_path=MODEL_PATH)
        else:
            with open(MODEL_PATH, "rb") as f:
                artifact = pickle.load(f)
        explainer = FraudExplainer(artifact["model"], artifact["features"])


class TransactionRequest(BaseModel):
    transaction_id: Optional[str] = Field(default_factory=lambda: f"TX-{int(time.time() * 1000) % 1000000}")
    amount: float = Field(..., example=84.50, description="Transaction Amount in USD")
    card_id: str = Field(..., example="card_visa_4412", description="Hashed cardholder / card token")
    device_id: str = Field(default="dev_chrome_mac", example="dev_chrome_mac")
    email: str = Field(default="shopper@gmail.com", example="shopper@gmail.com")
    distance_miles: float = Field(default=12.0, example=12.0, description="Distance between billing address and IP")
    device_type: str = Field(default="desktop", example="desktop")
    is_suspicious_device: bool = Field(default=False)
    timestamp: Optional[float] = Field(default=None)


class EvaluationResponse(BaseModel):
    transaction_id: str
    risk_score: float  # 0 to 100
    risk_probability: float  # 0.0 to 1.0
    decision: str  # "APPROVE", "STEP_UP_CHALLENGE", "DECLINE"
    action_description: str
    liability_shift: bool
    latency_ms: float
    reasons: List[Dict[str, Any]]
    velocity_snapshot: Dict[str, float]
    chargeback_risk_dollars: float
    user_insult_risk_dollars: float


@app.on_event("startup")
def startup_event():
    ensure_model_loaded()


@app.get("/api/health")
def health():
    ensure_model_loaded()
    return {
        "status": "healthy",
        "service": "FraudSentinel Real-Time API",
        "uptime_seconds": round(time.time() - start_time, 1),
        "p95_latency_target_ms": 25.0,
        "model_version": "LightGBM-CostWeighted-v1.4",
        "features_tracked": len(FEATURE_COLUMNS),
        "theta_low": artifact["policy"]["theta_low"],
        "theta_high": artifact["policy"]["theta_high"]
    }


@app.get("/api/metrics")
def get_metrics():
    ensure_model_loaded()
    return {
        "metrics": artifact["metrics"],
        "policy": {
            "theta_low": artifact["policy"]["theta_low"],
            "theta_high": artifact["policy"]["theta_high"],
            "optimal_threshold": artifact["policy"]["optimal_threshold"],
            "baseline_unmitigated_loss": artifact["policy"]["baseline_unmitigated_loss"],
            "optimized_total_loss": artifact["policy"]["optimized_total_loss"],
            "max_net_savings": artifact["policy"]["max_net_savings"],
            "operating_user_insult_rate_pct": artifact["policy"]["operating_user_insult_rate_pct"],
            "operating_fraud_recall_pct": artifact["policy"]["operating_fraud_recall_pct"]
        },
        "top_features": artifact["top_features"]
    }


@app.get("/api/cost-curve")
def get_cost_curve():
    ensure_model_loaded()
    return {"cost_curve": artifact["policy"]["cost_curve"]}


@app.post("/api/score", response_model=EvaluationResponse)
def score_transaction(req: TransactionRequest):
    t0 = time.perf_counter()
    ensure_model_loaded()

    curr_ts = req.timestamp if req.timestamp is not None else time.time()
    
    # 1. Real-time velocity computation (<1ms)
    v_feats = velocity_engine.update_and_compute(
        card_id=req.card_id,
        current_time=curr_ts,
        amount=req.amount,
        device_id=req.device_id
    )

    # 2. Extract identity & geo features
    domain = req.email.split("@")[-1].lower() if "@" in req.email else "missing"
    is_high_risk_domain = 1.0 if domain in HIGH_RISK_DOMAINS else 0.0
    is_suspicious_device = 1.0 if req.is_suspicious_device or ("tor" in req.device_id.lower() or "bot" in req.device_id.lower() or "emulator" in req.device_id.lower()) else 0.0
    dist1_clean = float(req.distance_miles)
    dist1_extreme = 1.0 if dist1_clean > 500.0 else 0.0

    amt = float(req.amount)
    amt_log = float(np.log1p(amt))
    is_micro = 1.0 if (1.0 <= amt <= 4.0) else 0.0
    is_round = 1.0 if (amt % 1 == 0) else 0.0

    # 3. Construct feature vector matching FEATURE_COLUMNS order
    raw_vector = {
        "tx_count_1h": v_feats["tx_count_1h"],
        "tx_amt_sum_1h": v_feats["tx_amt_sum_1h"],
        "tx_count_6h": v_feats["tx_count_6h"],
        "tx_count_24h": v_feats["tx_count_24h"],
        "tx_amt_sum_24h": v_feats["tx_amt_sum_24h"],
        "tx_amt_ratio_to_mean_24h": v_feats["tx_amt_ratio_to_mean_24h"],
        "tx_count_7d": v_feats["tx_count_7d"],
        "time_since_last_tx": v_feats["time_since_last_tx"],
        "device_switch_24h": v_feats["device_switch_24h"],
        "unique_devices_24h": v_feats["unique_devices_24h"],
        "dist1_clean": dist1_clean,
        "dist1_missing": 0.0,
        "dist1_log": float(np.log1p(max(dist1_clean, 0))),
        "dist1_extreme_flag": dist1_extreme,
        "email_domains_match": 1.0,
        "has_r_email": 0.0,
        "is_high_risk_p_email": is_high_risk_domain,
        "is_high_risk_r_email": 0.0,
        "is_mobile_device": 1.0 if req.device_type == "mobile" else 0.0,
        "is_desktop_device": 1.0 if req.device_type == "desktop" else 0.0,
        "is_suspicious_device_agent": is_suspicious_device,
        "TransactionAmt": amt,
        "amt_log": amt_log,
        "is_micro_auth_probing": is_micro,
        "is_round_amt": is_round,
        "card1": 14290.0,
        "card2": 555.0,
        "card3": 150.0,
        "card5": 226.0,
        "addr1": 315.0,
        "addr2": 87.0,
        "C1": 1.0,
        "C2": 1.0,
        "C3": 0.0,
        "C4": 0.0,
        "C5": 1.0,
        "D1": 14.0,
        "D2": 14.0,
        "D3": 0.0,
        "V1": 1.0,
        "V2": 1.0,
        "V3": 1.0,
        "V4": 1.0,
        "V5": 1.0,
        "V6": 1.0,
        "V7": 1.0,
        "V8": 1.0,
        "V9": 1.0,
        "V10": 1.0
    }

    feature_array = np.array([[raw_vector.get(c, -1.0) for c in FEATURE_COLUMNS]], dtype=np.float32)

    # 4. Model inference
    raw_score = artifact["model"].predict(feature_array, raw_score=True)[0]
    prob = float(1.0 / (1.0 + np.exp(-raw_score)))
    risk_score = round(prob * 100.0, 1)

    # 5. Multi-tier Cost Policy Decision
    theta_low = artifact["policy"]["theta_low"]
    theta_high = artifact["policy"]["theta_high"]

    if prob < theta_low:
        decision = "APPROVE"
        action_desc = "Frictionless auto-approval. Verified legitimate user pattern."
        liability_shift = False
    elif prob < theta_high:
        decision = "STEP_UP_CHALLENGE"
        action_desc = "3D-Secure 2.0 / OTP challenge prompted. Liability shifts to issuing bank."
        liability_shift = True
    else:
        decision = "DECLINE"
        action_desc = "Hard auto-decline. Adversarial risk factors exceed tolerance threshold."
        liability_shift = False

    # 6. Real-time SHAP reason codes
    reasons = explainer.explain(feature_array, top_k=4)

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    return EvaluationResponse(
        transaction_id=req.transaction_id,
        risk_score=risk_score,
        risk_probability=round(prob, 4),
        decision=decision,
        action_description=action_desc,
        liability_shift=liability_shift,
        latency_ms=latency_ms,
        reasons=reasons,
        velocity_snapshot=v_feats,
        chargeback_risk_dollars=round(prob * (amt + 20.0), 2),
        user_insult_risk_dollars=round((1.0 - prob) * 35.0, 2)
    )


@app.get("/api/recent-transactions")
def get_recent_transactions():
    """
    Returns realistic transaction stream items for live feed visualization.
    """
    sample_data = [
        {
            "id": "TX-892101",
            "time": "12s ago",
            "card": "Visa •••• 4291",
            "amount": 74.50,
            "user": "olivia.martinez@gmail.com",
            "device": "iPhone 15 Pro (Safari)",
            "geo": "Austin, TX (8 mi)",
            "score": 4.2,
            "decision": "APPROVE",
            "latency": "14ms",
            "reason": "Normal consumer baseline"
        },
        {
            "id": "TX-892102",
            "time": "34s ago",
            "card": "Mastercard •••• 1092",
            "amount": 1250.00,
            "user": "steve_buyer@protonmail.com",
            "device": "Unknown Linux TorBrowser",
            "geo": "Lagos, NG (6,420 mi)",
            "score": 93.8,
            "decision": "DECLINE",
            "latency": "19ms",
            "reason": "Extreme Geo Mismatch + Disposable Email + Tor Node"
        },
        {
            "id": "TX-892103",
            "time": "1m ago",
            "card": "Visa •••• 8841",
            "amount": 340.00,
            "user": "kevin.williams@yahoo.com",
            "device": "Windows 11 (Edge)",
            "geo": "Chicago, IL (410 mi)",
            "score": 41.5,
            "decision": "STEP_UP_CHALLENGE",
            "latency": "16ms",
            "reason": "New Device Fingerprint + Elevated Ticket Size"
        },
        {
            "id": "TX-892104",
            "time": "2m ago",
            "card": "Amex •••• 3042",
            "amount": 1.50,
            "user": "test_bot99@mailinator.com",
            "device": "Dalvik/2.1.0 Android Emulator",
            "geo": "Bucharest, RO (4,800 mi)",
            "score": 97.4,
            "decision": "DECLINE",
            "latency": "15ms",
            "reason": "Micro-auth probing pattern + Card Testing Attack"
        },
        {
            "id": "TX-892105",
            "time": "3m ago",
            "card": "Visa •••• 7120",
            "amount": 128.20,
            "user": "sarah.jenkins@apple.com",
            "device": "MacBook Pro (Chrome)",
            "geo": "Seattle, WA (4 mi)",
            "score": 2.1,
            "decision": "APPROVE",
            "latency": "12ms",
            "reason": "Trusted device token + local billing match"
        }
    ]
    return {"transactions": sample_data}
