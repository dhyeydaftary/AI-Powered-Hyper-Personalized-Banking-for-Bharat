"""Explanation service orchestrator."""

from typing import Any, Dict, List, Optional
from intelligence.src.explanation.llm_client import generate_llm_explanation
from intelligence.src.explanation.templates import render_template_explanation
from intelligence.src.safety.sanitizer import create_safe_explanation_context


def generate_explanation(
    decision: str,
    confidence: float,
    reason_codes: List[str],
    signals: Optional[Dict[str, Any]],
    action: Optional[Dict[str, Any]],
    language: str = "en",
) -> Dict[str, Any]:
    """
    Generates a customer-facing explanation.
    
    1. Minimizes and sanitizes all inputs (defends against prompt injection).
    2. Attempts optional LLM generation if configured.
    3. Seamlessly falls back to deterministic multilingual templates.
    """
    safe_context = create_safe_explanation_context(
        decision=decision,
        confidence=confidence,
        reason_codes=reason_codes,
        signals=signals,
        action=action,
        language=language,
    )

    # Try LLM if configured
    llm_result = generate_llm_explanation(safe_context)
    if llm_result:
        return {
            "language": language,
            "summary": llm_result,
            "details": llm_result,
            "action_text": action.get("title", "") if action else "",
            "full_explanation": llm_result,
            "source": "LLM",
        }

    # Deterministic template fallback
    template_result = render_template_explanation(
        decision=decision,
        language=language,
        signals=signals,
        action=action,
    )
    template_result["source"] = "TEMPLATE"
    return template_result
