# Customer Frontend Specification

## Required screens

### 1. Home / Financial Health
Show:
- financial health context
- EMI/income
- savings rate
- expense/income
- balance trend
- confidence

Avoid presenting confidence as certainty.

### 2. Copilot
Can:
- explain a decision
- answer follow-up questions
- communicate in preferred language

It cannot:
- change the decision
- approve a loan
- determine eligibility independently

### 3. Decision surface
Render all four states:
- recommendation
- intervention/support
- verification
- no action

### 4. Consent center
Toggles must produce an actual visible change in available analysis/actions.

### 5. What-if simulator
Customer enters hypothetical loan parameters.
System reruns the existing financial-health logic with the hypothetical input.

## UX rule
Do not hide the reason behind a recommendation or intervention.

## Before/after demo
Use the same synthetic customer at two points in time:
- Point A: healthy trajectory → relevant recommendation
- Point B: worsening trajectory → recommendation suppressed / support intervention
