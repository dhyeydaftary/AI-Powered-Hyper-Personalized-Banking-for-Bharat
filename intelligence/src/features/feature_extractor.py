"""Financial feature engineering layer."""

import math
from typing import Any, Dict, List, Optional
from intelligence.src.features.stability import (
    compute_income_stability,
    compute_cash_flow_stability,
)
from intelligence.src.schemas.models import CustomerProfile, Loan, Transaction


def extract_financial_features(
    customer: CustomerProfile,
    transactions: List[Transaction],
    loans: List[Loan],
) -> Dict[str, Any]:
    """
    Extracts deterministic statistical financial features from authorized customer context.
    
    Handles zero income, missing history, empty transactions, and loan absence safely.
    Returns python-native types with strict NaN/Infinity avoidance.
    """
    income = float(customer.monthly_income) if customer.monthly_income > 0 else 0.0

    # Group transactions by month (YYYY-MM)
    monthly_debits: Dict[str, float] = {}
    monthly_credits: Dict[str, float] = {}
    monthly_net: Dict[str, float] = {}

    for tx in transactions:
        # Extract month safely
        month_key = tx.date[:7] if len(tx.date) >= 7 else "UNKNOWN"
        if month_key not in monthly_debits:
            monthly_debits[month_key] = 0.0
            monthly_credits[month_key] = 0.0

        if tx.type == "DEBIT":
            monthly_debits[month_key] += float(tx.amount)
        elif tx.type == "CREDIT":
            monthly_credits[month_key] += float(tx.amount)

    # Unique active months
    active_months = [m for m in monthly_debits.keys() if m != "UNKNOWN"]
    history_months = len(active_months)

    total_debits = sum(monthly_debits.values())
    total_credits = sum(monthly_credits.values())

    for m in active_months:
        monthly_net[m] = monthly_credits[m] - monthly_debits[m]

    # Average monthly debit
    avg_monthly_debit = (
        total_debits / history_months if history_months > 0 else 0.0
    )

    # Total EMI burden across active obligations
    total_monthly_emi = sum(float(l.monthly_emi) for l in loans)
    total_outstanding = sum(float(l.outstanding) for l in loans)

    # Calculate Core Ratios (decimals, not percentages)
    if income > 0:
        emi_to_income_ratio = round(total_monthly_emi / income, 4)
        expense_to_income_ratio = round(avg_monthly_debit / income, 4)
        # Savings = Income minus average debits
        net_monthly_savings = income - avg_monthly_debit
        savings_rate = round(max(0.0, net_monthly_savings / income), 4)
        annual_income = income * 12
        loan_obligation_burden = round(total_outstanding / annual_income, 4)
    else:
        emi_to_income_ratio = None
        expense_to_income_ratio = None
        savings_rate = None
        loan_obligation_burden = None

    # Stability calculations
    income_stability = compute_income_stability(monthly_credits, income)
    cash_flow_stability = compute_cash_flow_stability(monthly_net)

    # Anomaly checks on debit spikes (debits > 80% monthly income)
    anomaly_spike_threshold = (income * 0.80) if income > 0 else 50000.0
    unusual_spikes = [
        tx for tx in transactions
        if tx.type == "DEBIT" and float(tx.amount) >= anomaly_spike_threshold
    ]

    return {
        "customer_id": customer.customer_id,
        "monthly_income": income,
        "history_months": history_months,
        "active_months": sorted(active_months),
        "total_debits": round(total_debits, 2),
        "total_credits": round(total_credits, 2),
        "avg_monthly_debit": round(avg_monthly_debit, 2),
        "total_monthly_emi": round(total_monthly_emi, 2),
        "total_outstanding": round(total_outstanding, 2),
        "emi_to_income_ratio": emi_to_income_ratio,
        "savings_rate": savings_rate,
        "expense_to_income_ratio": expense_to_income_ratio,
        "income_stability": income_stability,
        "cash_flow_stability": cash_flow_stability,
        "loan_obligation_burden": loan_obligation_burden,
        "monthly_debits": monthly_debits,
        "monthly_credits": monthly_credits,
        "monthly_net": monthly_net,
        "unusual_spike_count": len(unusual_spikes),
        "max_debit_amount": max([tx.amount for tx in transactions if tx.type == "DEBIT"], default=0.0),
    }
