"""Action selection layer — decoupled from decision classification."""

from typing import Any, Dict, List, Optional
from intelligence.src.policy.reason_codes import ReasonCode


def select_action(
    decision: str,
    reason_codes: List[str],
    features: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Selects a customer-benefit oriented next step.
    
    Optimizes for customer financial wellness, not product conversion.
    NO_ACTION returns None.
    """
    if decision == "NO_ACTION":
        return None

    if decision == "VERIFY":
        return {
            "action_type": "TRANSACTION_VERIFICATION",
            "title": "Review Recent Activity",
            "description": "Please confirm recent high-value or unusual debit activity on your account.",
            "priority": "HIGH",
            "metadata": {
                "requires_customer_acknowledgement": True,
                "action_channel": "IN_APP_PROMPT",
            },
        }

    if decision == "INTERVENE":
        if ReasonCode.HIGH_EMI_BURDEN in reason_codes:
            return {
                "action_type": "DEBT_RESTRUCTURING_ASSISTANCE",
                "title": "Loan Tenure & EMI Relief Options",
                "description": "Consider exploring flexible tenure extensions to lower your monthly outflow.",
                "priority": "HIGH",
                "metadata": {
                    "support_type": "FINANCIAL_COUNSELING",
                    "suggested_resource": "RM_ASSISTANCE",
                },
            }
        elif ReasonCode.DECLINING_SAVINGS in reason_codes:
            return {
                "action_type": "SAVINGS_GUIDANCE",
                "title": "Emergency Buffer & Expense Planning",
                "description": "Set up a micro-savings auto-sweep to gradually rebuild your cash reserve.",
                "priority": "MEDIUM",
                "metadata": {
                    "support_type": "BUDGET_ASSISTANCE",
                    "suggested_resource": "SMART_BUDGETING",
                },
            }
        else:
            return {
                "action_type": "EXPENSE_ALERT",
                "title": "Spending Review",
                "description": "Review recurring discretionary expenses to restore healthy monthly cash flow.",
                "priority": "MEDIUM",
                "metadata": {
                    "support_type": "EXPENSE_OPTIMIZATION",
                },
            }

    if decision == "RECOMMEND":
        savings_rate = features.get("savings_rate") or 0.0
        if savings_rate >= 0.20:
            return {
                "action_type": "HIGH_YIELD_SAVINGS",
                "title": "Auto-Sweep High Yield Deposit",
                "description": "Earn higher returns on your idle surplus with guaranteed liquidity.",
                "priority": "MEDIUM",
                "metadata": {
                    "product_category": "DEPOSIT",
                    "benefit": "HIGHER_INTEREST",
                },
            }
        else:
            return {
                "action_type": "PRE_APPROVED_FLEXI_CREDIT",
                "title": "Pre-Approved Reserve Credit Line",
                "description": "A pre-approved safety buffer available at zero maintenance cost.",
                "priority": "LOW",
                "metadata": {
                    "product_category": "CREDIT_LINE",
                    "benefit": "EMERGENCY_BUFFER",
                },
            }

    return None
