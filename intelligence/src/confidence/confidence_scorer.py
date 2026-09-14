"""Confidence scoring and cold-start evaluation engine."""

from typing import Any, Dict


def calculate_confidence(
    features: Dict[str, Any],
    trend_result: Dict[str, Any],
    anomaly_result: Dict[str, Any],
    has_loans: bool,
) -> Dict[str, Any]:
    """
    Computes a transparent, explainable confidence score between 0.0 and 1.0.
    
    Factors considered:
    1. History Depth: Available transaction months (thin file penalty).
    2. Data Completeness: Presence of verified income, obligations, and debit records.
    3. Signal Consistency: Alignment between trends and stability metrics.
    """
    history_months = features.get("history_months", 0)
    income = features.get("monthly_income", 0.0)
    income_stability = features.get("income_stability", 0.5)

    # 1. History Component (0.0 to 0.45)
    if history_months == 0:
        history_score = 0.15
        is_cold_start = True
    elif history_months == 1:
        history_score = 0.30
        is_cold_start = True
    elif history_months == 2:
        history_score = 0.38
        is_cold_start = False
    elif history_months == 3:
        history_score = 0.42
        is_cold_start = False
    else:
        history_score = 0.45
        is_cold_start = False

    # 2. Completeness Component (0.0 to 0.30)
    completeness = 0.0
    if income > 0:
        completeness += 0.15
    if features.get("total_debits", 0) > 0:
        completeness += 0.10
    if has_loans or features.get("total_monthly_emi", 0) >= 0:
        completeness += 0.05

    # 3. Stability & Consistency Component (0.0 to 0.25)
    consistency = float(income_stability) * 0.15
    if trend_result.get("balance_trend") in ["STABLE", "IMPROVING"]:
        consistency += 0.10
    elif trend_result.get("balance_trend") == "DECLINING":
        consistency += 0.08  # Valid persistent signal, not noise
    else:
        consistency += 0.04  # Volatile or insufficient data

    raw_confidence = history_score + completeness + consistency

    # Cold-start cap
    if is_cold_start:
        confidence = min(0.45, raw_confidence)
    else:
        # Conflicting signals penalty: high savings rate combined with high anomaly score
        if anomaly_result.get("is_anomalous") and features.get("savings_rate", 0) > 0.25:
            # Ambiguity penalty proportional to anomaly severity
            anomaly_score = anomaly_result.get("anomaly_score", 0.70)
            ambiguity_penalty = max(0.14, round(anomaly_score * 0.18, 2))
            raw_confidence -= ambiguity_penalty
        confidence = max(0.20, min(0.95, raw_confidence))

    return {
        "confidence": round(float(confidence), 2),
        "is_cold_start": is_cold_start,
        "breakdown": {
            "history_score": round(history_score, 2),
            "completeness_score": round(completeness, 2),
            "consistency_score": round(consistency, 2),
        },
    }
