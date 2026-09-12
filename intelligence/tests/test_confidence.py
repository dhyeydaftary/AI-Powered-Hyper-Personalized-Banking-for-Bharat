"""Tests for confidence scoring and cold-start handling."""

from intelligence.src.confidence.confidence_scorer import calculate_confidence


def test_confidence_multi_month_complete():
    features = {
        "history_months": 4,
        "monthly_income": 75000,
        "total_debits": 40000,
        "total_monthly_emi": 9000,
        "income_stability": 0.95,
        "savings_rate": 0.35,
    }
    trend_result = {"balance_trend": "STABLE"}
    anomaly_result = {"is_anomalous": False}

    result = calculate_confidence(features, trend_result, anomaly_result, has_loans=True)

    assert result["is_cold_start"] is False
    assert result["confidence"] >= 0.80


def test_confidence_cold_start():
    # Only 1 month history
    features = {
        "history_months": 1,
        "monthly_income": 35000,
        "total_debits": 2000,
        "total_monthly_emi": 0,
        "income_stability": 0.50,
    }
    trend_result = {"balance_trend": "STABLE"}
    anomaly_result = {"is_anomalous": False}

    result = calculate_confidence(features, trend_result, anomaly_result, has_loans=False)

    assert result["is_cold_start"] is True
    # Thin-file confidence must be capped <= 0.45
    assert result["confidence"] <= 0.45


def test_confidence_conflicting_signals_penalty():
    features = {
        "history_months": 3,
        "monthly_income": 75000,
        "total_debits": 25000,
        "total_monthly_emi": 0,
        "income_stability": 0.90,
        "savings_rate": 0.60,
    }
    trend_result = {"balance_trend": "STABLE"}
    # High savings rate conflicting with sudden extreme anomaly
    anomaly_result = {"is_anomalous": True, "anomaly_score": 0.85}

    result = calculate_confidence(features, trend_result, anomaly_result, has_loans=False)

    # Confidence should be penalized for signal ambiguity
    assert result["confidence"] < 0.85
