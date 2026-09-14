"""Tests for multilingual explanation engine (English, Hindi, Gujarati)."""

from intelligence.src.explanation.explainer import generate_explanation


def test_explanation_english():
    res = generate_explanation(
        decision="RECOMMEND",
        confidence=0.88,
        reason_codes=["HEALTHY_FINANCIAL_TREND"],
        signals={"savings_rate": 0.25},
        action={"title": "High Yield Deposit", "description": "Auto sweep setup"},
        language="en",
    )
    assert res["language"] == "en"
    assert "savings" in res["full_explanation"].lower()
    assert res["source"] in ["TEMPLATE", "LLM"]


def test_explanation_hindi():
    res = generate_explanation(
        decision="INTERVENE",
        confidence=0.85,
        reason_codes=["HIGH_EMI_BURDEN"],
        signals={"savings_rate": 0.08},
        action={"title": "ईएमआई राहत", "description": "पुनर्गठन विकल्प"},
        language="hi",
    )
    assert res["language"] == "hi"
    assert "मासिक" in res["full_explanation"] or "ईएमआई" in res["full_explanation"]


def test_explanation_gujarati():
    res = generate_explanation(
        decision="VERIFY",
        confidence=0.78,
        reason_codes=["UNUSUAL_TRANSACTION"],
        signals={},
        action={"title": "ચકાસણી", "description": "તાજેતરના વ્યવહારની ખાતરી કરો"},
        language="gu",
    )
    assert res["language"] == "gu"
    assert "વ્યવહાર" in res["full_explanation"] or "ખાતા" in res["full_explanation"]
