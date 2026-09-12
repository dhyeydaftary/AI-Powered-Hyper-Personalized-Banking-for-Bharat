"""What-If simulation engine.

Pure analysis operation: calculates hypothetical financial impacts without mutating persistent state.
"""

from copy import deepcopy
import math
from typing import Any, Dict
from intelligence.src.anomaly.anomaly_detector import detect_anomalies
from intelligence.src.confidence.confidence_scorer import calculate_confidence
from intelligence.src.features.feature_extractor import extract_financial_features
from intelligence.src.policy.policy_engine import evaluate_policy
from intelligence.src.schemas.models import (
    FinancialHealth,
    HypotheticalLoan,
    IntelligenceDecision,
    Loan,
    SimulationRequest,
    SimulationResult,
)
from intelligence.src.trends.trend_analyzer import analyze_trends


def calculate_hypothetical_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Calculates monthly EMI using standard reducing-balance loan formula."""
    if tenure_months <= 0:
        return 0.0

    monthly_rate = (annual_rate / 12.0) / 100.0
    if monthly_rate == 0:
        return round(principal / tenure_months, 2)

    factor = math.pow(1.0 + monthly_rate, tenure_months)
    emi = (principal * monthly_rate * factor) / (factor - 1.0)
    return round(emi, 2)


def run_simulation(req: SimulationRequest) -> SimulationResult:
    """
    Executes a pure, non-mutating simulation of a hypothetical new loan obligation.
    Returns current health, hypothetical health, and resulting decision.
    """
    # 1. Evaluate current financial health
    current_features = extract_financial_features(
        customer=req.customer,
        transactions=req.transactions,
        loans=req.loans,
    )
    current_trends = analyze_trends(
        features=current_features,
        analysis_permitted=req.analysis_scope.behavioral_trends and req.consent.behavioral_trend_analysis,
    )
    current_anomalies = detect_anomalies(
        transactions=req.transactions,
        monthly_income=req.customer.monthly_income,
        analysis_permitted=req.analysis_scope.anomaly_analysis and req.consent.anomaly_analysis,
    )
    current_confidence = calculate_confidence(
        features=current_features,
        trend_result=current_trends,
        anomaly_result=current_anomalies,
        has_loans=len(req.loans) > 0,
    )

    current_health = FinancialHealth(
        customer_id=req.customer.customer_id,
        emi_to_income_ratio=current_features.get("emi_to_income_ratio"),
        savings_rate=current_features.get("savings_rate"),
        expense_to_income_ratio=current_features.get("expense_to_income_ratio"),
        balance_trend=current_trends.get("balance_trend"),
        income_stability=current_features.get("income_stability"),
        history_months=current_features.get("history_months", 0),
        confidence=current_confidence.get("confidence", 0.5),
    )

    # 2. Extract hypothetical loan parameters
    hypo_data = req.simulation.get("hypothetical_loan")
    if isinstance(hypo_data, dict):
        hypo_loan = HypotheticalLoan(**hypo_data)
    else:
        hypo_loan = hypo_data

    hypo_emi = calculate_hypothetical_emi(
        principal=hypo_loan.principal,
        annual_rate=hypo_loan.annual_interest_rate,
        tenure_months=hypo_loan.tenure_months,
    )

    # Create simulated loan object (clean clone, non-mutating)
    simulated_loans = deepcopy(req.loans)
    simulated_loans.append(
        Loan(
            loan_id="SIM-HYPOTHETICAL-001",
            customer_id=req.customer.customer_id,
            principal=hypo_loan.principal,
            outstanding=hypo_loan.principal,
            monthly_emi=hypo_emi,
            annual_interest_rate=hypo_loan.annual_interest_rate,
            remaining_months=hypo_loan.tenure_months,
        )
    )

    # 3. Evaluate hypothetical financial health
    hypo_features = extract_financial_features(
        customer=req.customer,
        transactions=req.transactions,
        loans=simulated_loans,
    )
    hypo_trends = analyze_trends(
        features=hypo_features,
        analysis_permitted=req.analysis_scope.behavioral_trends and req.consent.behavioral_trend_analysis,
    )
    hypo_confidence = calculate_confidence(
        features=hypo_features,
        trend_result=hypo_trends,
        anomaly_result=current_anomalies,
        has_loans=True,
    )

    hypo_health = FinancialHealth(
        customer_id=req.customer.customer_id,
        emi_to_income_ratio=hypo_features.get("emi_to_income_ratio"),
        savings_rate=hypo_features.get("savings_rate"),
        expense_to_income_ratio=hypo_features.get("expense_to_income_ratio"),
        balance_trend=hypo_trends.get("balance_trend"),
        income_stability=hypo_features.get("income_stability"),
        history_months=hypo_features.get("history_months", 0),
        confidence=hypo_confidence.get("confidence", 0.5),
    )

    # 4. Resulting hypothetical decision
    hypo_decision = evaluate_policy(
        customer_id=req.customer.customer_id,
        features=hypo_features,
        trend_result=hypo_trends,
        anomaly_result=current_anomalies,
        confidence_result=hypo_confidence,
        analysis_scope=req.analysis_scope,
    )

    return SimulationResult(
        current=current_health,
        hypothetical=hypo_health,
        decision=hypo_decision,
    )
