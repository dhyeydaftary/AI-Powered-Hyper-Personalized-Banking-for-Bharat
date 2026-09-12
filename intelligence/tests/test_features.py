"""Tests for financial feature engineering and edge case handling."""

import math
import pytest
from intelligence.src.features.feature_extractor import extract_financial_features
from intelligence.src.schemas.models import CustomerProfile, Loan, Transaction


def test_feature_extraction_standard():
    customer = CustomerProfile(customer_id="C1001", monthly_income=75000)
    transactions = [
        Transaction(transaction_id="T1", customer_id="C1001", date="2026-06-01", amount=75000, type="CREDIT"),
        Transaction(transaction_id="T2", customer_id="C1001", date="2026-06-03", amount=9000, type="DEBIT"),
        Transaction(transaction_id="T3", customer_id="C1001", date="2026-06-10", amount=15000, type="DEBIT"),
        Transaction(transaction_id="T4", customer_id="C1001", date="2026-07-01", amount=75000, type="CREDIT"),
        Transaction(transaction_id="T5", customer_id="C1001", date="2026-07-03", amount=9000, type="DEBIT"),
        Transaction(transaction_id="T6", customer_id="C1001", date="2026-07-10", amount=15000, type="DEBIT"),
    ]
    loans = [
        Loan(loan_id="L1", customer_id="C1001", principal=250000, outstanding=180000, monthly_emi=9000)
    ]

    features = extract_financial_features(customer, transactions, loans)

    assert features["history_months"] == 2
    assert features["total_monthly_emi"] == 9000
    assert features["emi_to_income_ratio"] == pytest.approx(0.12, abs=0.01)
    # Average debits per month = 24000
    assert features["avg_monthly_debit"] == pytest.approx(24000, abs=1)
    assert features["expense_to_income_ratio"] == pytest.approx(0.32, abs=0.01)
    assert features["savings_rate"] == pytest.approx(0.68, abs=0.01)
    assert 0.0 <= features["income_stability"] <= 1.0


def test_feature_extraction_zero_income():
    customer = CustomerProfile(customer_id="C000", monthly_income=0)
    transactions = [
        Transaction(transaction_id="T1", customer_id="C000", date="2026-06-01", amount=5000, type="DEBIT")
    ]
    loans = []

    features = extract_financial_features(customer, transactions, loans)

    assert features["emi_to_income_ratio"] is None
    assert features["expense_to_income_ratio"] is None
    assert features["savings_rate"] is None
    assert not math.isnan(features["total_debits"])
    assert not math.isinf(features["total_debits"])


def test_feature_extraction_empty_transactions():
    customer = CustomerProfile(customer_id="C_NEW", monthly_income=50000)
    transactions = []
    loans = []

    features = extract_financial_features(customer, transactions, loans)

    assert features["history_months"] == 0
    assert features["total_debits"] == 0.0
    assert features["avg_monthly_debit"] == 0.0
    assert features["emi_to_income_ratio"] == 0.0
    assert features["savings_rate"] == 1.0
