"""Tests validating that intelligence payloads strictly conform to shared JSON schemas."""

import json
from pathlib import Path
import jsonschema
from intelligence.src.api.routes import analyze_customer, get_financial_health
from intelligence.src.schemas.models import (
    AnalysisRequest,
    AnalysisScope,
    ConsentState,
    CustomerProfile,
    Loan,
    Transaction,
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DECISION_SCHEMA_PATH = REPO_ROOT / "shared" / "schemas" / "decision.schema.json"
FINANCIAL_CONTEXT_SCHEMA_PATH = REPO_ROOT / "shared" / "schemas" / "financial-context.schema.json"


def test_decision_schema_compliance():
    with open(DECISION_SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    req = AnalysisRequest(
        customer=CustomerProfile(customer_id="C1001", monthly_income=75000),
        transactions=[
            Transaction(transaction_id="TX1", customer_id="C1001", date="2026-06-01", amount=75000, type="CREDIT"),
            Transaction(transaction_id="TX2", customer_id="C1001", date="2026-06-03", amount=9000, type="DEBIT"),
            Transaction(transaction_id="TX3", customer_id="C1001", date="2026-07-01", amount=75000, type="CREDIT"),
            Transaction(transaction_id="TX4", customer_id="C1001", date="2026-07-03", amount=9000, type="DEBIT"),
        ],
        loans=[
            Loan(loan_id="L1", customer_id="C1001", principal=250000, outstanding=180000, monthly_emi=9000)
        ],
        consent=ConsentState(),
        analysis_scope=AnalysisScope(),
    )

    decision_obj = analyze_customer(req)
    decision_dict = decision_obj.model_dump()

    # Must not raise jsonschema.ValidationError
    jsonschema.validate(instance=decision_dict, schema=schema)


def test_financial_context_schema_compliance():
    with open(FINANCIAL_CONTEXT_SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    req = AnalysisRequest(
        customer=CustomerProfile(customer_id="C1001", monthly_income=75000),
        transactions=[
            Transaction(transaction_id="TX1", customer_id="C1001", date="2026-06-01", amount=75000, type="CREDIT"),
            Transaction(transaction_id="TX2", customer_id="C1001", date="2026-06-03", amount=9000, type="DEBIT"),
        ],
        loans=[],
        consent=ConsentState(),
        analysis_scope=AnalysisScope(),
    )

    health_obj = get_financial_health(req)
    health_dict = health_obj.model_dump()

    # Must not raise jsonschema.ValidationError
    jsonschema.validate(instance=health_dict, schema=schema)
