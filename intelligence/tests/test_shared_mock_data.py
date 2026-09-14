"""Tests verifying end-to-end evaluation of shared/mock-data fixtures."""

import json
from pathlib import Path
from fastapi.testclient import TestClient
import pytest
from intelligence.src.app import create_app

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MOCK_DATA_DIR = REPO_ROOT / "shared" / "mock-data"


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


def test_shared_mock_data_c1001(client):
    # Load primary shared mock data
    with open(MOCK_DATA_DIR / "customer.json", "r", encoding="utf-8") as f:
        customer = json.load(f)
    with open(MOCK_DATA_DIR / "transactions.json", "r", encoding="utf-8") as f:
        transactions = json.load(f)
    with open(MOCK_DATA_DIR / "loan.json", "r", encoding="utf-8") as f:
        loan = json.load(f)

    payload = {
        "customer": customer,
        "transactions": transactions,
        "loans": [loan],
        "consent": customer["consent"],
        "analysis_scope": {
            "financial_context": True,
            "behavioral_trends": True,
            "anomaly_analysis": True,
        },
    }

    # Test /financial-health
    health_res = client.post("/financial-health", json=payload)
    assert health_res.status_code == 200
    health = health_res.json()
    assert health["customer_id"] == "C1001"
    assert health["emi_to_income_ratio"] == pytest.approx(0.12, abs=0.01)

    # Test /analyze
    decision_res = client.post("/analyze", json=payload)
    assert decision_res.status_code == 200
    decision = decision_res.json()
    assert decision["customer_id"] == "C1001"
    assert decision["decision"] in ["RECOMMEND", "INTERVENE", "VERIFY", "NO_ACTION"]
    assert "policy_version" in decision
    assert decision["policy_version"] == "v1.0"
    assert len(decision["reason_codes"]) > 0
