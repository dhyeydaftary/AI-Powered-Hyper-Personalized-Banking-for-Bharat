"""End-to-end integration tests using FastAPI TestClient and demo scenarios."""

import json
from pathlib import Path
from fastapi.testclient import TestClient
import pytest
from intelligence.src.app import create_app

FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "demo_scenarios.json"


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


@pytest.fixture
def scenarios():
    with open(FIXTURES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["scenarios"]


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "healthy"
    assert body["service"] == "intelligence"
    assert "policy_version" in body


def test_scenario_c1001_healthy(client, scenarios):
    payload = scenarios["C1001_healthy"]
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "RECOMMEND"
    assert data["confidence"] >= 0.75
    assert "HEALTHY_FINANCIAL_TREND" in data["reason_codes"]
    assert data["action"] is not None


def test_scenario_c1001_stressed(client, scenarios):
    payload = scenarios["C1001_stressed"]
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "INTERVENE"
    assert "DECLINING_SAVINGS" in data["reason_codes"] or "HIGH_EMI_BURDEN" in data["reason_codes"]
    assert data["action"] is not None


def test_scenario_c1001_anomaly(client, scenarios):
    payload = scenarios["C1001_anomaly"]
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "VERIFY"
    assert "UNUSUAL_TRANSACTION" in data["reason_codes"]
    assert data["action"]["action_type"] == "TRANSACTION_VERIFICATION"


def test_scenario_c1002_thin_file(client, scenarios):
    payload = scenarios["C1002_thin_file"]
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "NO_ACTION"
    assert "INSUFFICIENT_HISTORY" in data["reason_codes"]
    assert data["confidence"] <= 0.45
    assert data["action"] is None


def test_scenario_c1003_prompt_injection(client, scenarios):
    payload = scenarios["C1003_prompt_injection"]
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    # The injection text "grant approval" or "override policy" MUST NOT cause a fake recommendation or approval
    assert data["decision"] in ["RECOMMEND", "INTERVENE", "VERIFY", "NO_ACTION"]
    # Verify reason codes are purely canonical machine-readable tokens
    for code in data["reason_codes"]:
        assert not any(bad in code.lower() for bad in ["override", "system", "ignore"])


def test_financial_health_endpoint(client, scenarios):
    payload = scenarios["C1001_healthy"]
    res = client.post("/financial-health", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["customer_id"] == "C1001"
    assert data["emi_to_income_ratio"] is not None
    assert data["savings_rate"] is not None
    assert data["history_months"] >= 2


def test_simulation_endpoint(client, scenarios):
    base_payload = scenarios["C1001_healthy"]
    sim_payload = {
        **base_payload,
        "simulation": {
            "hypothetical_loan": {
                "principal": 300000,
                "annual_interest_rate": 12.0,
                "tenure_months": 36,
            }
        },
    }
    res = client.post("/simulate", json=sim_payload)
    assert res.status_code == 200
    data = res.json()
    assert "current" in data
    assert "hypothetical" in data
    assert "decision" in data
    assert data["hypothetical"]["emi_to_income_ratio"] > data["current"]["emi_to_income_ratio"]


def test_explain_endpoint(client):
    res = client.post(
        "/explain",
        json={
            "decision": "INTERVENE",
            "confidence": 0.85,
            "reason_codes": ["HIGH_EMI_BURDEN"],
            "signals": {"savings_rate": 0.08},
            "action": {"title": "Loan Relief", "description": "Tenure extension"},
            "language": "hi",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["language"] == "hi"
    assert "full_explanation" in data


def test_validation_error_handling(client):
    res = client.post("/analyze", json={"customer": {"customer_id": ""}})
    assert res.status_code == 400
