"""Deterministic Policy Engine (v1.0).

Enforces the core rule:
ML understands. Policy decides. LLM explains.
"""

from datetime import datetime, timezone
import json
import os
from typing import Any, Dict, List, Optional
from intelligence.src.actions.action_selector import select_action
from intelligence.src.policy.reason_codes import ReasonCode
from intelligence.src.schemas.models import AnalysisScope, DecisionType, IntelligenceDecision

# Centralized policy version
POLICY_VERSION = "v1.0"


def evaluate_policy(
    customer_id: str,
    features: Dict[str, Any],
    trend_result: Dict[str, Any],
    anomaly_result: Dict[str, Any],
    confidence_result: Dict[str, Any],
    analysis_scope: AnalysisScope,
    policy_config: Optional[Dict[str, Any]] = None,
) -> IntelligenceDecision:
    """
    Evaluates customer signals against deterministic policy rules.
    
    Priority Hierarchy:
    1. Cold-start without anomaly -> NO_ACTION (with INSUFFICIENT_HISTORY)
    2. Active Anomaly in scope    -> VERIFY (Anomaly != Fraud)
    3. Financial Stress           -> INTERVENE (Proactive support)
    4. Healthy Trajectory         -> RECOMMEND (Customer benefit)
    5. Neutral/No change          -> NO_ACTION (Withhold nudges)
    """
    cfg = policy_config or {}
    stress_cfg = cfg.get("stress_thresholds", {
        "emi_to_income_high": 0.35,
        "savings_rate_low": 0.10,
        "expense_to_income_high": 0.75,
    })
    healthy_cfg = cfg.get("healthy_thresholds", {
        "emi_to_income_max": 0.35,
        "savings_rate_min": 0.15,
        "income_stability_min": 0.70,
    })

    emi_ratio = features.get("emi_to_income_ratio")
    savings_rate = features.get("savings_rate")
    expense_ratio = features.get("expense_to_income_ratio")
    income_stability = features.get("income_stability") or 0.5
    balance_trend = trend_result.get("balance_trend")
    is_cold_start = confidence_result.get("is_cold_start", False)
    is_anomalous = anomaly_result.get("is_anomalous", False) and analysis_scope.anomaly_analysis

    decision: DecisionType
    reason_codes: List[str] = []

    # 1. Cold-Start / Thin-File Check
    if is_cold_start and not is_anomalous:
        decision = "NO_ACTION"
        reason_codes = [ReasonCode.INSUFFICIENT_HISTORY.value, ReasonCode.LOW_DATA_CONFIDENCE.value]

    # 2. Active Anomaly Check (VERIFY)
    elif is_anomalous:
        decision = "VERIFY"
        reason_codes = anomaly_result.get("reason_codes", [ReasonCode.UNUSUAL_TRANSACTION.value])

    # 3. Financial Stress Check (INTERVENE)
    elif (
        (emi_ratio is not None and emi_ratio > stress_cfg["emi_to_income_high"]) or
        (savings_rate is not None and savings_rate < stress_cfg["savings_rate_low"]) or
        (expense_ratio is not None and expense_ratio > stress_cfg["expense_to_income_high"]) or
        (balance_trend == "DECLINING" and analysis_scope.behavioral_trends)
    ):
        decision = "INTERVENE"
        if emi_ratio is not None and emi_ratio > stress_cfg["emi_to_income_high"]:
            reason_codes.append(ReasonCode.HIGH_EMI_BURDEN.value)
        if savings_rate is not None and savings_rate < stress_cfg["savings_rate_low"]:
            reason_codes.append(ReasonCode.DECLINING_SAVINGS.value)
        if expense_ratio is not None and expense_ratio > stress_cfg["expense_to_income_high"]:
            reason_codes.append(ReasonCode.RISING_EXPENSE_RATIO.value)
        if not reason_codes and balance_trend == "DECLINING":
            reason_codes.append(ReasonCode.DECLINING_SAVINGS.value)

    # 4. Healthy Financial Position Check (RECOMMEND)
    elif (
        savings_rate is not None and savings_rate >= healthy_cfg["savings_rate_min"] and
        (emi_ratio is None or emi_ratio <= healthy_cfg["emi_to_income_max"]) and
        income_stability >= healthy_cfg["income_stability_min"] and
        balance_trend in ["STABLE", "IMPROVING"]
    ):
        decision = "RECOMMEND"
        reason_codes.append(ReasonCode.HEALTHY_FINANCIAL_TREND.value)
        reason_codes.append(ReasonCode.STABLE_INCOME.value)
        if emi_ratio is not None and emi_ratio <= 0.20:
            reason_codes.append(ReasonCode.BALANCED_OBLIGATIONS.value)

    # 5. Default / Neutral Check (NO_ACTION)
    else:
        decision = "NO_ACTION"
        reason_codes.append(ReasonCode.NO_MATERIAL_CHANGE.value)

    # Action Selection
    action = select_action(decision, reason_codes, features)

    # Signal payload for auditability & dashboard visibility
    signals = {
        "emi_to_income_ratio": emi_ratio,
        "savings_rate": savings_rate,
        "expense_to_income_ratio": expense_ratio,
        "balance_trend": balance_trend,
        "income_stability": income_stability,
        "history_months": features.get("history_months", 0),
        "total_monthly_emi": features.get("total_monthly_emi", 0.0),
        "avg_monthly_debit": features.get("avg_monthly_debit", 0.0),
        "anomaly_score": anomaly_result.get("anomaly_score", 0.0),
    }

    now_iso = datetime.now(timezone.utc).isoformat()
    # Deterministic decision ID format
    decision_id = f"DEC-{customer_id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

    return IntelligenceDecision(
        decision_id=decision_id,
        customer_id=customer_id,
        decision=decision,
        confidence=confidence_result.get("confidence", 0.5),
        reason_codes=reason_codes,
        action=action,
        signals=signals,
        policy_version=POLICY_VERSION,
        timestamp=now_iso,
    )
