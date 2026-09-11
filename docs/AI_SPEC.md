# AI / ML Specification

## Financial context
Calculate:
- EMI-to-income ratio
- savings rate
- expense-to-income ratio
- balance trend
- income stability

## Behavioral analysis
Use a rolling multi-month window.
Distinguish sustained change from normal month-to-month noise.

A single unusual month should not automatically establish a trend.

## Anomaly analysis
Analyze individual transactions against the customer's historical baseline.

Output:
```json
{
  "is_anomalous": true,
  "score": 0.82,
  "reason_codes": ["UNUSUAL_TRANSACTION"]
}
```

The anomaly detector identifies an anomaly; it does not declare fraud.

## Confidence
Confidence must reflect:
- amount of available history
- data completeness
- signal strength
- model certainty

Thin-file customers receive lower confidence and conservative decisions.

## Cold start
If history is insufficient:
- do not fabricate trends
- lower confidence
- prefer `VERIFY` or `NO_ACTION` where appropriate
- avoid aggressive recommendations

## Implementation boundary
The intelligence module exposes deterministic service functions/API outputs. Backend and frontend must not reimplement financial formulas independently.
