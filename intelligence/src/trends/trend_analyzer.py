"""Multi-month behavioral and temporal trend analysis engine."""

from typing import Any, Dict, List, Literal, Optional
import numpy as np

TrendClassification = Literal["IMPROVING", "STABLE", "DECLINING", "VOLATILE", "INSUFFICIENT_DATA"]


def analyze_trends(
    features: Dict[str, Any],
    analysis_permitted: bool = True,
) -> Dict[str, Any]:
    """
    Analyzes temporal trends across monthly buckets.
    Respects consent and analysis scope.
    """
    if not analysis_permitted:
        return {
            "balance_trend": None,
            "savings_trend": None,
            "expense_trend": None,
            "trend_confidence": 0.5,
            "analysis_applied": False,
        }

    history_months = features.get("history_months", 0)
    monthly_debits = features.get("monthly_debits", {})
    monthly_credits = features.get("monthly_credits", {})
    income = features.get("monthly_income", 0.0)

    # Cold-start handling
    if history_months < 2:
        # Single month cannot establish a trend
        savings_rate = features.get("savings_rate")
        default_trend = "STABLE" if (savings_rate is not None and savings_rate >= 0.15) else "INSUFFICIENT_DATA"
        return {
            "balance_trend": default_trend,
            "savings_trend": "INSUFFICIENT_DATA",
            "expense_trend": "INSUFFICIENT_DATA",
            "trend_confidence": 0.40,
            "analysis_applied": True,
            "is_thin_file": True,
        }

    sorted_months = sorted(monthly_debits.keys())
    debit_series = [monthly_debits[m] for m in sorted_months]
    credit_series = [monthly_credits[m] for m in sorted_months]
    net_savings_series = [credit_series[i] - debit_series[i] for i in range(len(sorted_months))]

    # Trend calculation using linear regression slope
    x = np.arange(len(sorted_months), dtype=float)

    # Savings trend
    savings_slope = float(np.polyfit(x, net_savings_series, 1)[0]) if len(x) >= 2 else 0.0

    # Expense trend
    expense_slope = float(np.polyfit(x, debit_series, 1)[0]) if len(x) >= 2 else 0.0

    # Significance threshold (5% of income per month)
    threshold = (income * 0.05) if income > 0 else 2500.0

    if savings_slope > threshold:
        balance_trend: TrendClassification = "IMPROVING"
        savings_trend = "GROWING"
    elif savings_slope < -threshold:
        balance_trend = "DECLINING"
        savings_trend = "DECLINING"
    else:
        balance_trend = "STABLE"
        savings_trend = "STABLE"

    # Expense trend classification
    if expense_slope > threshold:
        expense_trend = "RISING"
    elif expense_slope < -threshold:
        expense_trend = "FALLING"
    else:
        expense_trend = "STABLE"

    # Check for volatility
    if len(net_savings_series) >= 3:
        diffs = np.diff(net_savings_series)
        sign_changes = np.sum(diffs[:-1] * diffs[1:] < 0)
        if sign_changes >= 2:
            balance_trend = "VOLATILE"

    return {
        "balance_trend": balance_trend,
        "savings_trend": savings_trend,
        "expense_trend": expense_trend,
        "savings_slope": round(savings_slope, 2),
        "expense_slope": round(expense_slope, 2),
        "trend_confidence": min(0.95, 0.60 + (history_months * 0.08)),
        "analysis_applied": True,
        "is_thin_file": False,
    }
