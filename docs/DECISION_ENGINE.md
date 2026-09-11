# Decision Engine Specification

## Inputs
- financial context
- behavioral trend
- anomaly signal
- confidence
- consent scope
- available history

## Outputs
One and only one:
- `RECOMMEND`
- `INTERVENE`
- `VERIFY`
- `NO_ACTION`

## Decision philosophy
The engine is customer-benefit-oriented, not conversion-oriented.

## Prototype policy examples

### RECOMMEND
Use when:
- financial position is healthy
- relevant product benefit is supported
- confidence is sufficient
- no material stress/anomaly signal requires another action

### INTERVENE
Use when:
- sustained deterioration suggests financial stress
- support is more appropriate than additional credit

Example signals:
- rising EMI burden
- declining savings
- worsening expense/income

### VERIFY
Use when:
- a transaction or pattern is unusual
- evidence is ambiguous
- human/customer confirmation is appropriate

Do not call an anomalous transaction "fraud" automatically.

### NO_ACTION
Use when:
- there is no clear customer benefit
- evidence is insufficient
- the correct behavior is to avoid unnecessary nudging

## Important
Thresholds used in the prototype are demo configuration parameters, not universal financial rules.

## Reason codes
Examples:
- `HIGH_EMI_BURDEN`
- `DECLINING_SAVINGS`
- `RISING_EXPENSE_RATIO`
- `UNUSUAL_TRANSACTION`
- `LOW_DATA_CONFIDENCE`
- `HEALTHY_FINANCIAL_TREND`
- `STABLE_INCOME`
- `INSUFFICIENT_HISTORY`

Reason codes must be machine-readable and deterministic.
