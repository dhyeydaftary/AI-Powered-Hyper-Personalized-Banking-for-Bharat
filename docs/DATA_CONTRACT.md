# Data Contract v1

## Customer

```json
{
  "customer_id": "C1001",
  "name": "Synthetic Customer",
  "age": 32,
  "preferred_language": "en",
  "monthly_income": 75000,
  "consent": {
    "behavioral_trend_analysis": true,
    "anomaly_analysis": true,
    "vernacular_assistance": true
  }
}
```

## Transaction

```json
{
  "transaction_id": "TX1001",
  "customer_id": "C1001",
  "date": "2026-08-01",
  "amount": 2500,
  "type": "DEBIT",
  "category": "GROCERIES",
  "description": "Grocery Store",
  "merchant": "Synthetic Mart"
}
```

## Loan / EMI

```json
{
  "loan_id": "L1001",
  "customer_id": "C1001",
  "principal": 250000,
  "outstanding": 180000,
  "monthly_emi": 9000,
  "annual_interest_rate": 11.5,
  "remaining_months": 24
}
```

## Financial context

```json
{
  "emi_to_income_ratio": 0.32,
  "savings_rate": 0.18,
  "expense_to_income_ratio": 0.61,
  "balance_trend": "STABLE",
  "income_stability": 0.91,
  "history_months": 6,
  "confidence": 0.86
}
```

## Signal conventions
- ratios are decimals, not percentages
- confidence is 0..1
- dates use ISO `YYYY-MM-DD`
- monetary values are INR numeric values
- enums use uppercase snake case

## Missing data
Never invent missing customer data.
Represent missing fields as `null` and lower confidence when the missing information materially affects the decision.
