"""Data models and schemas conforming to shared repository contracts."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class CustomerProfile(BaseModel):
    """Customer profile provided by the backend."""
    customer_id: str
    name: str = "Synthetic Customer"
    age: int = 30
    preferred_language: str = "en"
    monthly_income: float = Field(default=0.0, ge=0.0)


class Transaction(BaseModel):
    """Individual transaction record."""
    transaction_id: str
    customer_id: str
    date: str
    amount: float = Field(ge=0.0)
    type: Literal["DEBIT", "CREDIT"]
    category: str = "GENERAL"
    description: str = ""
    merchant: str = "Unknown"


class Loan(BaseModel):
    """Active loan/obligation record."""
    loan_id: str
    customer_id: str
    principal: float = Field(ge=0.0)
    outstanding: float = Field(ge=0.0)
    monthly_emi: float = Field(ge=0.0)
    annual_interest_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    remaining_months: int = Field(default=0, ge=0)


class ConsentState(BaseModel):
    """Customer consent toggles controlling permitted analysis scopes."""
    behavioral_trend_analysis: bool = True
    anomaly_analysis: bool = True
    vernacular_assistance: bool = True


class AnalysisScope(BaseModel):
    """Permitted analysis scope as evaluated by backend and consent."""
    financial_context: bool = True
    behavioral_trends: bool = True
    anomaly_analysis: bool = True


class AnalysisRequest(BaseModel):
    """Standard analysis payload received from the backend orchestrator."""
    customer: CustomerProfile
    transactions: List[Transaction] = Field(default_factory=list)
    loans: List[Loan] = Field(default_factory=list)
    consent: ConsentState = Field(default_factory=ConsentState)
    analysis_scope: AnalysisScope = Field(default_factory=AnalysisScope)


class FinancialHealth(BaseModel):
    """Financial context conforming strictly to shared/schemas/financial-context.schema.json."""
    customer_id: str
    emi_to_income_ratio: Optional[float] = None
    savings_rate: Optional[float] = None
    expense_to_income_ratio: Optional[float] = None
    balance_trend: Optional[str] = None
    income_stability: Optional[float] = None
    confidence: float = Field(ge=0.0, le=1.0)
    history_months: int = Field(ge=0)


DecisionType = Literal["RECOMMEND", "INTERVENE", "VERIFY", "NO_ACTION"]


class RecommendedAction(BaseModel):
    """Specific actionable next step attached to a decision."""
    action_type: str
    title: str
    description: str
    priority: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class IntelligenceDecision(BaseModel):
    """Canonical decision object conforming strictly to shared/schemas/decision.schema.json."""
    decision_id: str
    customer_id: str
    decision: DecisionType
    confidence: float = Field(ge=0.0, le=1.0)
    reason_codes: List[str]
    action: Optional[Dict[str, Any]] = None
    signals: Optional[Dict[str, Any]] = None
    policy_version: str
    timestamp: str


class HypotheticalLoan(BaseModel):
    """Parameters for what-if simulation."""
    principal: float = Field(gt=0.0)
    annual_interest_rate: float = Field(ge=0.0, le=100.0)
    tenure_months: int = Field(gt=0, le=360)


class SimulationRequest(AnalysisRequest):
    """Simulation request with hypothetical loan."""
    simulation: Dict[str, HypotheticalLoan]


class SimulationResult(BaseModel):
    """What-if simulation output."""
    current: FinancialHealth
    hypothetical: FinancialHealth
    decision: IntelligenceDecision
