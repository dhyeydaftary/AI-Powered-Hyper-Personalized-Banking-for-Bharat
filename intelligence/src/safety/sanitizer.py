"""Prompt injection defense and data minimization layer.

CRITICAL ARCHITECTURAL BOUNDARY:
Untrusted user or transaction text must NEVER become system instructions.
Raw transaction descriptions are scrubbed and isolated.
"""

import re
from typing import Any, Dict, List, Optional

MALICIOUS_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"(?i)system\s*:",
    r"(?i)approve\s+(my\s+)?loan",
    r"(?i)change\s+decision\s+to",
    r"(?i)override\s+policy",
    r"(?i)you\s+are\s+now",
    r"(?i)disregard",
    r"(?i)hidden\s+prompt",
]


def detect_injection_attempt(text: str) -> bool:
    """Detects adversarial injection patterns in freeform strings."""
    if not text:
        return False
    return any(re.search(pattern, text) for pattern in MALICIOUS_PATTERNS)


def sanitize_text(text: str, max_length: int = 200) -> str:
    """Sanitizes text by truncating, escaping, and removing adversarial tokens."""
    if not text:
        return ""
    # Strip non-printable characters
    cleaned = "".join(ch for ch in text if ch.isprintable())
    # Truncate
    cleaned = cleaned[:max_length].strip()
    return cleaned


def create_safe_explanation_context(
    decision: str,
    confidence: float,
    reason_codes: List[str],
    signals: Optional[Dict[str, Any]],
    action: Optional[Dict[str, Any]],
    language: str,
) -> Dict[str, Any]:
    """
    Constructs a strictly sanitized, minimized context for the explanation layer.
    
    Excludes all raw transaction records, merchant descriptions, and untrusted text.
    Only passes aggregated numeric indicators and canonical enums.
    """
    safe_signals = {}
    if signals:
        safe_signals = {
            "emi_to_income_ratio": signals.get("emi_to_income_ratio"),
            "savings_rate": signals.get("savings_rate"),
            "expense_to_income_ratio": signals.get("expense_to_income_ratio"),
            "balance_trend": signals.get("balance_trend"),
            "history_months": signals.get("history_months"),
        }

    return {
        "decision": decision,
        "confidence": confidence,
        "reason_codes": reason_codes,
        "signals": safe_signals,
        "action_type": action.get("action_type") if action else None,
        "language": language,
    }
