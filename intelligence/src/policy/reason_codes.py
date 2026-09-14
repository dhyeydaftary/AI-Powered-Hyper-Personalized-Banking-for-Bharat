"""Machine-readable reason code definitions for policy decisions."""

from enum import Enum
from typing import Dict


class ReasonCode(str, Enum):
    # Stress indicators (INTERVENE)
    HIGH_EMI_BURDEN = "HIGH_EMI_BURDEN"
    DECLINING_SAVINGS = "DECLINING_SAVINGS"
    RISING_EXPENSE_RATIO = "RISING_EXPENSE_RATIO"
    INCOME_VOLATILITY = "INCOME_VOLATILITY"

    # Uncertainty / Anomaly indicators (VERIFY)
    UNUSUAL_TRANSACTION = "UNUSUAL_TRANSACTION"
    UNUSUAL_SPENDING = "UNUSUAL_SPENDING"

    # Cold-start / Data quality indicators (NO_ACTION / VERIFY)
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"
    LOW_DATA_CONFIDENCE = "LOW_DATA_CONFIDENCE"

    # Healthy indicators (RECOMMEND)
    HEALTHY_FINANCIAL_TREND = "HEALTHY_FINANCIAL_TREND"
    STABLE_INCOME = "STABLE_INCOME"
    BALANCED_OBLIGATIONS = "BALANCED_OBLIGATIONS"
    IMPROVING_SAVINGS = "IMPROVING_SAVINGS"

    # Neutral indicators (NO_ACTION)
    NO_MATERIAL_CHANGE = "NO_MATERIAL_CHANGE"


REASON_CODE_METADATA: Dict[str, Dict[str, str]] = {
    ReasonCode.HIGH_EMI_BURDEN: {
        "label": "High Monthly EMI Ratio",
        "description": "Monthly EMI obligations exceed 35% of monthly income.",
    },
    ReasonCode.DECLINING_SAVINGS: {
        "label": "Declining Savings Buffer",
        "description": "Net monthly savings rate has dropped below sustainable levels (<10%).",
    },
    ReasonCode.RISING_EXPENSE_RATIO: {
        "label": "Elevated Expense Ratio",
        "description": "Monthly living expenses exceed 75% of income or show a persistent upward trajectory.",
    },
    ReasonCode.UNUSUAL_TRANSACTION: {
        "label": "Unusual Transaction Pattern",
        "description": "A single debit transaction deviates substantially from baseline spending.",
    },
    ReasonCode.UNUSUAL_SPENDING: {
        "label": "Unusual Spending Spike",
        "description": "Spending volume in a category or period diverges from historical norm.",
    },
    ReasonCode.INSUFFICIENT_HISTORY: {
        "label": "Thin-File / Limited History",
        "description": "Less than two months of transaction records available; withholding active nudges.",
    },
    ReasonCode.LOW_DATA_CONFIDENCE: {
        "label": "Low Data Confidence",
        "description": "Available history or data completeness is insufficient for active recommendations.",
    },
    ReasonCode.HEALTHY_FINANCIAL_TREND: {
        "label": "Healthy Financial Trajectory",
        "description": "Customer demonstrates positive net cash flows and sustainable savings habits.",
    },
    ReasonCode.STABLE_INCOME: {
        "label": "Stable Income Flow",
        "description": "Consistent recurring monthly income credits observed.",
    },
    ReasonCode.BALANCED_OBLIGATIONS: {
        "label": "Manageable Debt Obligations",
        "description": "Existing loan obligations are well within safe debt-service thresholds.",
    },
    ReasonCode.NO_MATERIAL_CHANGE: {
        "label": "No Material Change",
        "description": "Current trajectory is stable with no specific intervention or product need.",
    },
}
