"""Input validation and sanity checks for financial data payloads."""

from datetime import datetime
from typing import List, Tuple
from intelligence.src.schemas.models import AnalysisRequest


def validate_analysis_request(req: AnalysisRequest) -> Tuple[bool, List[str]]:
    """
    Performs safety and domain validation on an AnalysisRequest.
    Returns (is_valid, list_of_error_messages).
    """
    errors: List[str] = []

    # Customer checks
    if not req.customer.customer_id or not req.customer.customer_id.strip():
        errors.append("customer_id cannot be empty")

    if req.customer.monthly_income < 0:
        errors.append("monthly_income cannot be negative")

    # Transaction checks
    for idx, tx in enumerate(req.transactions):
        if tx.amount < 0:
            errors.append(f"Transaction at index {idx} ({tx.transaction_id}) has negative amount")

        if tx.type not in ["DEBIT", "CREDIT"]:
            errors.append(f"Transaction at index {idx} has invalid type '{tx.type}'")

        if len(tx.date) < 7:
            errors.append(f"Transaction at index {idx} has invalid date format '{tx.date}'")

    # Loan checks
    for idx, loan in enumerate(req.loans):
        if loan.principal < 0:
            errors.append(f"Loan at index {idx} ({loan.loan_id}) has negative principal")
        if loan.monthly_emi < 0:
            errors.append(f"Loan at index {idx} ({loan.loan_id}) has negative monthly_emi")
        if loan.outstanding < 0:
            errors.append(f"Loan at index {idx} ({loan.loan_id}) has negative outstanding balance")

    return len(errors) == 0, errors
