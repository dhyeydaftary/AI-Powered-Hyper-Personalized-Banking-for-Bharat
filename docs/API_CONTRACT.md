# API Contract v1

Base URL:
`/api/v1`

All responses use JSON.

## Standard response

Success:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## Customers

### GET /customers/:customerId
Returns customer profile and consent summary.

### GET /customers/:customerId/transactions
Returns synthetic transaction history.

### GET /customers/:customerId/financial-health
Returns calculated financial context.

### POST /customers/:customerId/analyze
Runs the intelligence pipeline.

Request:
```json
{
  "analysis_scope": {
    "financial_context": true,
    "behavioral_trends": true,
    "anomaly_analysis": true
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "decision": {}
  },
  "error": null
}
```

### GET /customers/:customerId/decision
Returns the latest structured decision.

### GET /customers/:customerId/audit
Returns decision audit entries.

### GET /customers/:customerId/consent
Returns consent state.

### PUT /customers/:customerId/consent
Request:
```json
{
  "behavioral_trend_analysis": true,
  "anomaly_analysis": true,
  "vernacular_assistance": true
}
```

### POST /customers/:customerId/feedback
Request:
```json
{
  "event_type": "ENGAGED",
  "decision_id": "DEC-001",
  "metadata": {}
}
```

## What-if simulator

### POST /customers/:customerId/simulate
Request:
```json
{
  "loan": {
    "principal": 300000,
    "annual_interest_rate": 12,
    "tenure_months": 36
  }
}
```

Response must return:
- current financial health
- hypothetical financial health
- changed ratios
- resulting decision
- explanation/reason codes

## Decision object
The canonical shape is defined in:
`shared/schemas/decision.schema.json`

Do not create alternate decision formats per branch.
