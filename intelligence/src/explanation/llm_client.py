"""Optional LLM integration with strict safety boundaries and automatic template fallback."""

import os
from typing import Any, Dict, Optional
import httpx


def generate_llm_explanation(
    safe_context: Dict[str, Any],
    api_key: Optional[str] = None,
    timeout_seconds: float = 5.0,
) -> Optional[str]:
    """
    Invokes external LLM to generate an explanation from sanitized facts ONLY.
    
    CRITICAL CONSTRAINTS:
    - Never receives raw transaction strings.
    - Cannot alter the decision or reason codes.
    - If unavailable or timing out, returns None to trigger template fallback.
    """
    key = api_key or os.getenv("LLM_API_KEY")
    if not key:
        return None

    # Structured prompt isolating system instruction from facts
    system_instruction = (
        "You are a helpful, empathetic banking copilot for customers in Bharat. "
        "Explain the already-determined financial status clearly, concisely, and respectfully. "
        "DO NOT determine loan approval or reject credit. "
        "DO NOT alter the decision or reason codes. "
        "DO NOT mention fraud. "
        "Answer in the requested language."
    )

    user_prompt = (
        f"Language: {safe_context.get('language', 'en')}\n"
        f"Decision: {safe_context.get('decision')}\n"
        f"Reason Codes: {', '.join(safe_context.get('reason_codes', []))}\n"
        f"Key Indicators: {safe_context.get('signals')}\n"
        f"Suggested Action: {safe_context.get('action_type')}\n"
        "Generate a 2-sentence explanation for the customer."
    )

    try:
        # Example generic OpenAI/Gemini compatible completion if key provided
        # For offline prototype stability, returns None unless an active provider is configured
        provider = os.getenv("LLM_PROVIDER", "none").lower()
        if provider == "none":
            return None

        # If an active endpoint is set up in .env
        endpoint = os.getenv("LLM_ENDPOINT", "https://api.openai.com/v1/chat/completions")
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": 150,
            "temperature": 0.2,
        }

        with httpx.Client(timeout=timeout_seconds) as client:
            resp = client.post(endpoint, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                return content
    except Exception:
        # Fall back silently to deterministic template
        pass

    return None
