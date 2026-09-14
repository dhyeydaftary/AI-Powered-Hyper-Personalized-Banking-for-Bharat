"""Tests for what-if simulation engine."""

from intelligence.src.schemas.models import (
    AnalysisScope,
    ConsentState,
    CustomerProfile,
    HypotheticalLoan,
    Loan,
    SimulationRequest,
    Transaction,
)
from intelligence.src.simulation.simulator import calculate_hypothetical_emi, run_simulation


def test_hypothetical_emi_calculation():
    # 300,000 INR loan at 12% for 36 months
    # Standard formula: P * r * (1+r)^n / ((1+r)^n - 1)
    emi = calculate_hypothetical_emi(300000, 12, 36)
    # Expected EMI ~ 9964.29
    assert 9900 <= emi <= 10050


def test_simulation_pure_and_non_mutating():
    customer = CustomerProfile(customer_id="C1001", monthly_income=75000)
    original_loans = [
        Loan(loan_id="L1", customer_id="C1001", principal=200000, outstanding=150000, monthly_emi=8000)
    ]
    transactions = [
        Transaction(transaction_id="T1", customer_id="C1001", date="2026-06-01", amount=75000, type="CREDIT"),
        Transaction(transaction_id="T2", customer_id="C1001", date="2026-06-03", amount=8000, type="DEBIT"),
        Transaction(transaction_id="T3", customer_id="C1001", date="2026-06-10", amount=20000, type="DEBIT"),
        Transaction(transaction_id="T4", customer_id="C1001", date="2026-07-01", amount=75000, type="CREDIT"),
        Transaction(transaction_id="T5", customer_id="C1001", date="2026-07-03", amount=8000, type="DEBIT"),
        Transaction(transaction_id="T6", customer_id="C1001", date="2026-07-10", amount=20000, type="DEBIT"),
    ]

    req = SimulationRequest(
        customer=customer,
        transactions=transactions,
        loans=original_loans,
        consent=ConsentState(),
        analysis_scope=AnalysisScope(),
        simulation={"hypothetical_loan": HypotheticalLoan(principal=500000, annual_interest_rate=14.0, tenure_months=36)},
    )

    initial_loan_count = len(req.loans)

    res = run_simulation(req)

    # 1. State non-mutation check: original loans list must remain unchanged
    assert len(req.loans) == initial_loan_count

    # 2. Results check: hypothetical EMI ratio should be strictly higher than current
    assert res.current.emi_to_income_ratio is not None
    assert res.hypothetical.emi_to_income_ratio is not None
    assert res.hypothetical.emi_to_income_ratio > res.current.emi_to_income_ratio

    # 3. Decision generated
    assert res.decision.decision in ["RECOMMEND", "INTERVENE", "VERIFY", "NO_ACTION"]
