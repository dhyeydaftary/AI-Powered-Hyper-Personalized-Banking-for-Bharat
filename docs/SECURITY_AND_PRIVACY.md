# Security, Privacy & Responsible AI

## Prototype rule
Synthetic data only.

Never commit:
- real customer financial data
- API keys
- passwords
- production database credentials
- `.env` files

## Consent
Analysis must respect consent scope.
If a customer has not consented to a particular analysis, that analysis must not run.

## Data minimization
Only pass the minimum structured information required to the LLM.

## LLM boundary
LLM:
- explains
- translates
- converses

LLM does NOT:
- approve/reject credit
- decide eligibility
- classify a transaction as fraud
- override policy

## Prompt injection defense
Transaction descriptions and other untrusted text must be treated as data, not instructions.

Sanitize and isolate untrusted content before it reaches the LLM.

## Auditability
Every decision should record:
- decision ID
- reason codes
- confidence
- policy version
- timestamp

## No-action safety
The system must be capable of deliberately withholding a recommendation.
