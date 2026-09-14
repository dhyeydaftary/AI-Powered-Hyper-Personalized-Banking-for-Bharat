"""Statistical anomaly detection engine for transactions and spending behavior."""

from typing import Any, Dict, List, Optional
import numpy as np
from intelligence.src.schemas.models import Transaction


def detect_anomalies(
    transactions: List[Transaction],
    monthly_income: float,
    analysis_permitted: bool = True,
    z_score_threshold: float = 3.0,
    single_tx_to_income_ratio: float = 0.80,
) -> Dict[str, Any]:
    """
    Detects statistical transaction deviations against the customer baseline.
    
    CRITICAL PRINCIPLE:
    Anomaly != Fraud.
    This component detects unusual patterns requiring verification;
    it never classifies any activity as fraudulent.
    """
    if not analysis_permitted or not transactions:
        return {
            "is_anomalous": False,
            "anomaly_score": 0.0,
            "anomalies": [],
            "reason_codes": [],
            "analysis_applied": analysis_permitted,
        }

    debits = [tx for tx in transactions if tx.type == "DEBIT"]
    if not debits:
        return {
            "is_anomalous": False,
            "anomaly_score": 0.0,
            "anomalies": [],
            "reason_codes": [],
            "analysis_applied": True,
        }

    debit_amounts = np.array([float(tx.amount) for tx in debits], dtype=float)
    anomalies_detected: List[Dict[str, Any]] = []

    # 1. Extreme Spike relative to monthly income
    income_spike_threshold = (monthly_income * single_tx_to_income_ratio) if monthly_income > 0 else 50000.0

    for tx in debits:
        amount = float(tx.amount)
        if amount >= income_spike_threshold:
            anomalies_detected.append({
                "type": "UNUSUAL_TRANSACTION_AMOUNT",
                "severity": "HIGH" if amount > monthly_income else "MEDIUM",
                "confidence": 0.85,
                "transaction_id": tx.transaction_id,
                "amount": amount,
                "threshold": income_spike_threshold,
                "category": tx.category,
            })

    # 2. Z-Score / Median Absolute Deviation (MAD) if sufficient history
    if len(debit_amounts) >= 5:
        median_val = float(np.median(debit_amounts))
        mad = float(np.median(np.abs(debit_amounts - median_val)))

        if mad > 0:
            # Modified Z-score using MAD: 0.6745 * (x - median) / MAD
            modified_z_scores = 0.6745 * (debit_amounts - median_val) / mad
            for idx, z in enumerate(modified_z_scores):
                if z >= z_score_threshold:
                    tx = debits[idx]
                    # Avoid duplicate if already caught by income spike
                    if not any(a["transaction_id"] == tx.transaction_id for a in anomalies_detected):
                        anomalies_detected.append({
                            "type": "UNUSUAL_SPENDING_DEVIATION",
                            "severity": "HIGH" if z > 4.5 else "MEDIUM",
                            "confidence": min(0.95, round(0.70 + (z * 0.05), 2)),
                            "transaction_id": tx.transaction_id,
                            "amount": float(tx.amount),
                            "category": tx.category,
                            "z_score": round(float(z), 2),
                        })

    is_anomalous = len(anomalies_detected) > 0
    if is_anomalous:
        max_severity = max(
            [1.0 if a.get("severity") == "HIGH" else 0.6 for a in anomalies_detected],
            default=0.5
        )
        anomaly_score = round(min(0.95, 0.50 + (0.25 * len(anomalies_detected)) * max_severity), 2)
        reason_codes = ["UNUSUAL_TRANSACTION"]
    else:
        anomaly_score = 0.0
        reason_codes = []

    return {
        "is_anomalous": is_anomalous,
        "anomaly_score": anomaly_score,
        "anomalies": anomalies_detected,
        "reason_codes": reason_codes,
        "analysis_applied": True,
    }
