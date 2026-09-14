"""Tests for deterministic policy engine covering all four decision states."""

from intelligence.src.policy.policy_engine import evaluate_policy
from intelligence.src.policy.reason_codes import ReasonCode
from intelligence.src.schemas.models import AnalysisScope


def test_policy_recommend():
    features = {
        "monthly_income": 75000,
        "emi_to_income_ratio": 0.12,
        "savings_rate": 0.35,
        "expense_to_income_ratio": 0.53,
        "income_stability": 0.95,
        "history_months": 3,
    }
    trend = {"balance_trend": "STABLE"}
    anomaly = {"is_anomalous": False, "reason_codes": []}
    confidence = {"confidence": 0.88, "is_cold_start": False}
    scope = AnalysisScope()

    decision = evaluate_policy("C1001", features, trend, anomaly, confidence, scope)

    assert decision.decision == "RECOMMEND"
    assert ReasonCode.HEALTHY_FINANCIAL_TREND.value in decision.reason_codes
    assert ReasonCode.STABLE_INCOME.value in decision.reason_codes
    assert decision.action is not None
    assert decision.action["action_type"] in ["HIGH_YIELD_SAVINGS", "PRE_APPROVED_FLEXI_CREDIT"]


def test_policy_intervene_high_emi():
    features = {
        "monthly_income": 50000,
        "emi_to_income_ratio": 0.48,  # > 0.35
        "savings_rate": 0.05,         # < 0.10
        "expense_to_income_ratio": 0.85,
        "income_stability": 0.80,
        "history_months": 3,
    }
    trend = {"balance_trend": "DECLINING"}
    anomaly = {"is_anomalous": False, "reason_codes": []}
    confidence = {"confidence": 0.82, "is_cold_start": False}
    scope = AnalysisScope()

    decision = evaluate_policy("C1001", features, trend, anomaly, confidence, scope)

    assert decision.decision == "INTERVENE"
    assert ReasonCode.HIGH_EMI_BURDEN.value in decision.reason_codes
    assert ReasonCode.DECLINING_SAVINGS.value in decision.reason_codes
    assert decision.action is not None
    assert decision.action["action_type"] == "DEBT_RESTRUCTURING_ASSISTANCE"


def test_policy_verify_on_anomaly():
    features = {
        "monthly_income": 75000,
        "emi_to_income_ratio": 0.12,
        "savings_rate": 0.35,
        "expense_to_income_ratio": 0.53,
        "income_stability": 0.90,
        "history_months": 3,
    }
    trend = {"balance_trend": "STABLE"}
    anomaly = {
        "is_anomalous": True,
        "anomaly_score": 0.85,
        "reason_codes": [ReasonCode.UNUSUAL_TRANSACTION.value],
    }
    confidence = {"confidence": 0.75, "is_cold_start": False}
    scope = AnalysisScope()

    # Even though savings and income are healthy, Anomaly takes priority -> VERIFY
    decision = evaluate_policy("C1001", features, trend, anomaly, confidence, scope)

    assert decision.decision == "VERIFY"
    assert ReasonCode.UNUSUAL_TRANSACTION.value in decision.reason_codes
    assert decision.action is not None
    assert decision.action["action_type"] == "TRANSACTION_VERIFICATION"


def test_policy_no_action_cold_start():
    features = {
        "monthly_income": 35000,
        "emi_to_income_ratio": 0.0,
        "savings_rate": 0.80,
        "expense_to_income_ratio": 0.20,
        "income_stability": 0.50,
        "history_months": 1,
    }
    trend = {"balance_trend": "STABLE"}
    anomaly = {"is_anomalous": False, "reason_codes": []}
    confidence = {"confidence": 0.35, "is_cold_start": True}
    scope = AnalysisScope()

    decision = evaluate_policy("C1002", features, trend, anomaly, confidence, scope)

    assert decision.decision == "NO_ACTION"
    assert ReasonCode.INSUFFICIENT_HISTORY.value in decision.reason_codes
    assert decision.action is None
