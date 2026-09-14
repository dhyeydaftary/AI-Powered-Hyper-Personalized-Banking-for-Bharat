"""Tests for temporal trend engine."""

import pytest
from intelligence.src.trends.trend_analyzer import analyze_trends


def test_trend_declining():
    # Net savings declining over 3 months
    features = {
        "history_months": 3,
        "monthly_income": 60000,
        "monthly_debits": {"2026-06": 20000, "2026-07": 35000, "2026-08": 50000},
        "monthly_credits": {"2026-06": 60000, "2026-07": 60000, "2026-08": 60000},
    }
    result = analyze_trends(features, analysis_permitted=True)

    assert result["balance_trend"] == "DECLINING"
    assert result["savings_trend"] == "DECLINING"
    assert result["expense_trend"] == "RISING"
    assert result["savings_slope"] < 0


def test_trend_improving():
    # Net savings improving
    features = {
        "history_months": 3,
        "monthly_income": 70000,
        "monthly_debits": {"2026-06": 45000, "2026-07": 35000, "2026-08": 20000},
        "monthly_credits": {"2026-06": 70000, "2026-07": 70000, "2026-08": 70000},
    }
    result = analyze_trends(features, analysis_permitted=True)

    assert result["balance_trend"] == "IMPROVING"
    assert result["savings_trend"] == "GROWING"
    assert result["expense_trend"] == "FALLING"


def test_trend_stable():
    # Stable spending & credits
    features = {
        "history_months": 3,
        "monthly_income": 75000,
        "monthly_debits": {"2026-06": 30000, "2026-07": 30500, "2026-08": 29800},
        "monthly_credits": {"2026-06": 75000, "2026-07": 75000, "2026-08": 75000},
    }
    result = analyze_trends(features, analysis_permitted=True)

    assert result["balance_trend"] == "STABLE"
    assert result["savings_trend"] == "STABLE"


def test_trend_cold_start():
    # Only 1 month of history
    features = {
        "history_months": 1,
        "monthly_income": 50000,
        "monthly_debits": {"2026-08": 20000},
        "monthly_credits": {"2026-08": 50000},
        "savings_rate": 0.60,
    }
    result = analyze_trends(features, analysis_permitted=True)

    assert result["is_thin_file"] is True
    assert result["savings_trend"] == "INSUFFICIENT_DATA"
