"""Stability metric calculations for income and cash flows."""

from typing import Dict, List
import numpy as np


def compute_income_stability(monthly_credits: Dict[str, float], baseline_income: float) -> float:
    """
    Computes income stability on a 0.0 to 1.0 scale.
    
    Uses coefficient of variation (CV = std_dev / mean) across monthly credit amounts.
    A customer with regular monthly salary credits has CV ~ 0 -> stability ~ 1.0.
    Thin file or single month defaults to a conservative baseline (0.75-0.85).
    """
    if not monthly_credits:
        return 0.50

    credits_list = list(monthly_credits.values())
    if len(credits_list) <= 1:
        # With only 1 month, if the credit roughly matches reported monthly income, high stability
        credit_val = credits_list[0]
        if baseline_income > 0:
            deviation = abs(credit_val - baseline_income) / baseline_income
            return max(0.40, min(0.95, round(1.0 - deviation, 2)))
        return 0.70

    arr = np.array(credits_list, dtype=float)
    mean_val = np.mean(arr)
    if mean_val <= 0:
        return 0.0

    std_val = np.std(arr)
    cv = std_val / mean_val
    # Map CV to 0..1 scale: CV=0 -> 1.0, CV>=0.5 -> <= 0.5
    stability = max(0.10, min(1.0, 1.0 - cv))
    return round(float(stability), 2)


def compute_cash_flow_stability(monthly_net_flows: Dict[str, float]) -> float:
    """
    Computes net cash flow volatility.
    Lower variance relative to average flow implies higher stability.
    """
    if len(monthly_net_flows) <= 1:
        return 0.50

    flows = list(monthly_net_flows.values())
    arr = np.array(flows, dtype=float)
    std_val = float(np.std(arr))
    mean_abs = float(np.mean(np.abs(arr)))

    if mean_abs == 0:
        return 1.0

    volatility_ratio = std_val / (mean_abs + 1e-6)
    score = max(0.0, min(1.0, 1.0 / (1.0 + volatility_ratio)))
    return round(float(score), 2)
