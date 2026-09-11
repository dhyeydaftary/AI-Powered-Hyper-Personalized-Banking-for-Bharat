# Bank / Relationship Manager Dashboard

## Required views

### Customer overview
- customer ID
- financial context
- current decision
- confidence

### Decision detail
- decision ID
- decision type
- reason codes
- underlying signals
- confidence
- action selected
- policy version
- timestamp

### Suppressed recommendations
Show:
- what would otherwise have been offered
- why it was withheld
- relevant signals

### Audit log
Every decision must be traceable.

Example:
```json
{
  "decision_id": "DEC-10492",
  "customer_id": "C1001",
  "decision": "INTERVENE",
  "reason_codes": ["HIGH_EMI_BURDEN", "DECLINING_SAVINGS"],
  "confidence": 0.87,
  "policy_version": "v1.0",
  "timestamp": "2026-09-12T10:30:00Z"
}
```

The dashboard is an audit/governance surface, not a second decision engine.
