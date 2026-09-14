"""API router for the intelligence service."""

from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from intelligence.src.anomaly.anomaly_detector import detect_anomalies
from intelligence.src.confidence.confidence_scorer import calculate_confidence
from intelligence.src.explanation.explainer import generate_explanation
from intelligence.src.features.feature_extractor import extract_financial_features
from intelligence.src.policy.policy_engine import POLICY_VERSION, evaluate_policy
from intelligence.src.safety.validator import validate_analysis_request
from intelligence.src.schemas.models import (
    AnalysisRequest,
    FinancialHealth,
    IntelligenceDecision,
    SimulationRequest,
    SimulationResult,
)
from intelligence.src.simulation.simulator import run_simulation
from intelligence.src.trends.trend_analyzer import analyze_trends

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    Indicates service readiness without exposing environment secrets.
    """
    return {
        "status": "healthy",
        "service": "intelligence",
        "version": "1.0.0",
        "policy_version": POLICY_VERSION,
    }


@router.post(
    "/analyze",
    response_model=IntelligenceDecision,
    status_code=status.HTTP_200_OK,
)
def analyze_customer(request: AnalysisRequest) -> IntelligenceDecision:
    """
    Executes the full intelligence pipeline:
    Features -> Trends -> Anomalies -> Confidence -> Policy -> Action.
    
    Output strictly conforms to shared/schemas/decision.schema.json.
    """
    is_valid, errors = validate_analysis_request(request)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "messages": errors},
        )

    # 1. Feature Engineering
    features = extract_financial_features(
        customer=request.customer,
        transactions=request.transactions,
        loans=request.loans,
    )

    # 2. Behavioral Trend Analysis (Consent + Scope enforced)
    trend_permitted = (
        request.analysis_scope.behavioral_trends and
        request.consent.behavioral_trend_analysis
    )
    trend_result = analyze_trends(features, analysis_permitted=trend_permitted)

    # 3. Statistical Anomaly Analysis (Consent + Scope enforced)
    anomaly_permitted = (
        request.analysis_scope.anomaly_analysis and
        request.consent.anomaly_analysis
    )
    anomaly_result = detect_anomalies(
        transactions=request.transactions,
        monthly_income=request.customer.monthly_income,
        analysis_permitted=anomaly_permitted,
    )

    # 4. Confidence & Cold-Start Scorer
    confidence_result = calculate_confidence(
        features=features,
        trend_result=trend_result,
        anomaly_result=anomaly_result,
        has_loans=len(request.loans) > 0,
    )

    # 5. Deterministic Policy Evaluation
    decision = evaluate_policy(
        customer_id=request.customer.customer_id,
        features=features,
        trend_result=trend_result,
        anomaly_result=anomaly_result,
        confidence_result=confidence_result,
        analysis_scope=request.analysis_scope,
    )

    return decision


@router.post(
    "/financial-health",
    response_model=FinancialHealth,
    status_code=status.HTTP_200_OK,
)
def get_financial_health(request: AnalysisRequest) -> FinancialHealth:
    """
    Computes financial health context.
    Conforms strictly to shared/schemas/financial-context.schema.json.
    """
    is_valid, errors = validate_analysis_request(request)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "messages": errors},
        )

    features = extract_financial_features(
        customer=request.customer,
        transactions=request.transactions,
        loans=request.loans,
    )

    trend_permitted = (
        request.analysis_scope.behavioral_trends and
        request.consent.behavioral_trend_analysis
    )
    trend_result = analyze_trends(features, analysis_permitted=trend_permitted)

    anomaly_permitted = (
        request.analysis_scope.anomaly_analysis and
        request.consent.anomaly_analysis
    )
    anomaly_result = detect_anomalies(
        transactions=request.transactions,
        monthly_income=request.customer.monthly_income,
        analysis_permitted=anomaly_permitted,
    )

    confidence_result = calculate_confidence(
        features=features,
        trend_result=trend_result,
        anomaly_result=anomaly_result,
        has_loans=len(request.loans) > 0,
    )

    return FinancialHealth(
        customer_id=request.customer.customer_id,
        emi_to_income_ratio=features.get("emi_to_income_ratio"),
        savings_rate=features.get("savings_rate"),
        expense_to_income_ratio=features.get("expense_to_income_ratio"),
        balance_trend=trend_result.get("balance_trend"),
        income_stability=features.get("income_stability"),
        history_months=features.get("history_months", 0),
        confidence=confidence_result.get("confidence", 0.5),
    )


@router.post(
    "/simulate",
    response_model=SimulationResult,
    status_code=status.HTTP_200_OK,
)
def simulate_scenario(request: SimulationRequest) -> SimulationResult:
    """
    Pure what-if simulation of a hypothetical loan.
    Non-mutating; does not touch persistent customer data.
    """
    is_valid, errors = validate_analysis_request(request)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "messages": errors},
        )

    return run_simulation(request)


@router.post("/explain", status_code=status.HTTP_200_OK)
def explain_decision(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Customer-facing multilingual explanation endpoint (English, Hindi, Gujarati).
    Safely translates structured facts into empathetic vernacular text.
    """
    decision = payload.get("decision", "NO_ACTION")
    confidence = payload.get("confidence", 0.5)
    reason_codes = payload.get("reason_codes", [])
    signals = payload.get("signals")
    action = payload.get("action")
    language = payload.get("language", "en")

    return generate_explanation(
        decision=decision,
        confidence=confidence,
        reason_codes=reason_codes,
        signals=signals,
        action=action,
        language=language,
    )
