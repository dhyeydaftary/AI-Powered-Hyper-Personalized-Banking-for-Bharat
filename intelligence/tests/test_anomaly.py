"""Tests for statistical anomaly detection engine."""

from intelligence.src.anomaly.anomaly_detector import detect_anomalies
from intelligence.src.schemas.models import Transaction


def test_anomaly_detection_spike():
    # Transaction exceeding 80% of monthly income
    transactions = [
        Transaction(transaction_id="TX1", customer_id="C1", date="2026-06-01", amount=75000, type="CREDIT"),
        Transaction(transaction_id="TX2", customer_id="C1", date="2026-06-05", amount=3500, type="DEBIT"),
        Transaction(transaction_id="TX3", customer_id="C1", date="2026-06-15", amount=4000, type="DEBIT"),
        Transaction(transaction_id="TX4", customer_id="C1", date="2026-06-25", amount=95000, type="DEBIT"),
    ]
    result = detect_anomalies(transactions, monthly_income=75000, analysis_permitted=True)

    assert result["is_anomalous"] is True
    assert result["anomaly_score"] > 0.50
    assert "UNUSUAL_TRANSACTION" in result["reason_codes"]
    # Verify no 'fraud' terminology is used
    anomalies_str = str(result["anomalies"]).lower()
    assert "fraud" not in anomalies_str


def test_anomaly_detection_normal():
    # Normal spending
    transactions = [
        Transaction(transaction_id="TX1", customer_id="C1", date="2026-06-01", amount=50000, type="CREDIT"),
        Transaction(transaction_id="TX2", customer_id="C1", date="2026-06-05", amount=2000, type="DEBIT"),
        Transaction(transaction_id="TX3", customer_id="C1", date="2026-06-10", amount=3000, type="DEBIT"),
        Transaction(transaction_id="TX4", customer_id="C1", date="2026-06-15", amount=1500, type="DEBIT"),
    ]
    result = detect_anomalies(transactions, monthly_income=50000, analysis_permitted=True)

    assert result["is_anomalous"] is False
    assert result["anomaly_score"] == 0.0
    assert len(result["anomalies"]) == 0


def test_anomaly_detection_consent_disabled():
    transactions = [
        Transaction(transaction_id="TX_BIG", customer_id="C1", date="2026-06-25", amount=100000, type="DEBIT")
    ]
    result = detect_anomalies(transactions, monthly_income=50000, analysis_permitted=False)

    assert result["is_anomalous"] is False
    assert result["anomaly_score"] == 0.0
