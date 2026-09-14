# Bharat Banking — AI/ML Financial Intelligence Service

The **Intelligence Service** is a dedicated, explainable financial intelligence microservice for **AI-Powered Hyper-Personalized Banking for Bharat**.

It processes authorized customer financial context (customer profile, rolling transactions, obligations/EMIs, consent toggles, and analysis scopes) and produces a machine-readable, deterministic structured decision that the backend orchestrator can consume.

---

## 1. Core Architecture Principle

> **ML understands. Policy decides. LLM explains.**

An LLM must **NEVER** independently determine credit approvals, credit rejections, loan eligibility, or fraud.

```
Authorized Financial Context (from Backend)
                  ↓
       [Feature Engineering Layer]
  (EMI ratio, savings rate, expense ratio, stability)
                  ↓
       [Temporal Trend Engine]         [Anomaly Detection Engine]
  (Multi-month trajectory analysis)  (Baseline Z-score / MAD deviations)
                  ↓                                 ↓
       [Confidence & Cold-Start Evaluation Engine]
                  ↓
       [Deterministic Policy Engine (v1.0)]
  (Priority: VERIFY → INTERVENE → RECOMMEND → NO_ACTION)
                  ↓
       [Action Selection Layer]
  (SAVINGS_GUIDANCE, VERIFICATION_REVIEW, etc.)
                  ↓
       [Structured Decision Payload]
                  ↓
       [Explanation Layer (en, hi, gu)]
  (Sanitized Structured Facts Only — Zero Untrusted Prompt Text)
```

---

## 2. Four Canonical Decision States

1. **`RECOMMEND`**: The customer demonstrates healthy, stable financial behavior with positive net cash flows and manageable debt obligations. The system recommends beneficial products (e.g. high-yield auto-sweep deposits).
2. **`INTERVENE`**: The customer's trajectory reveals financial stress or sustained deterioration (e.g. high EMI burden, declining savings buffer, rising expense ratios). The system recommends proactive relief or counseling.
3. **`VERIFY`**: The system detects an anomalous transaction or ambiguous spending pattern requiring confirmation. **Anomaly ≠ Fraud.**
4. **`NO_ACTION`**: No meaningful intervention or recommendation is justified (e.g. thin-file customer, insufficient data, or neutral financial position). Withholding nudges is a first-class feature.

---

## 3. Mathematical & Algorithmic Methodology

### 3.1 Feature Engineering
- **EMI-to-Income Ratio**: $\frac{\sum \text{Monthly EMIs}}{\text{Monthly Income}}$.
- **Savings Rate**: $\max\left(0, \frac{\text{Monthly Income} - \text{Avg Monthly Debits}}{\text{Monthly Income}}\right)$.
- **Expense-to-Income Ratio**: $\frac{\text{Avg Monthly Debits}}{\text{Monthly Income}}$.
- **Income Stability**: Based on the coefficient of variation (CV) of recurring monthly credits:
  $$\text{CV} = \frac{\sigma_{\text{credits}}}{\mu_{\text{credits}}}, \quad \text{Stability} = \max(0.10, \min(1.0, 1.0 - \text{CV}))$$

### 3.2 Temporal Trend Engine
- Evaluates monthly spending and savings buckets across rolling calendar months.
- Computes linear regression slope ($m$) on net savings series ($x = [0, 1, \dots, n-1]$):
  - If $m > 0.05 \times \text{Income} \implies \textbf{IMPROVING}$
  - If $m < -0.05 \times \text{Income} \implies \textbf{DECLINING}$
  - High directional oscillations $\implies \textbf{VOLATILE}$
  - Else $\implies \textbf{STABLE}$
- If history $< 2$ months, flags `is_thin_file` and prevents artificial trend extrapolation.

### 3.3 Anomaly Detection Engine
- Evaluates debit amounts against historical customer baseline using **Median Absolute Deviation (MAD)**:
  $$\text{Modified } Z = 0.6745 \times \frac{|x - \text{Median}|}{\text{MAD}}$$
- Flags transactions exceeding $Z \ge 3.0$ or single debits exceeding $80\%$ of monthly income.
- Respects customer consent: if `anomaly_analysis` is disabled in consent/scope, anomaly evaluation is bypassed.
- Strictly adheres to: **Anomaly ≠ Fraud.**

### 3.4 Confidence Engine
Calculates a confidence score ($0.0 \to 1.0$) based on:
1. **History Depth** ($0.15 \to 0.45$): penalizes thin-files ($< 2$ months capped at $\le 0.45$).
2. **Data Completeness** ($0.00 \to 0.30$): verifies income, active debits, and loan records.
3. **Signal Consistency** ($0.00 \to 0.25$): penalizes volatile or conflicting signals (e.g. high savings rate with sudden extreme anomaly).

### 3.5 Deterministic Policy Engine (v1.0)
Priority hierarchy:
1. **Cold-Start / Thin-File**: $\to \textbf{NO\_ACTION}$ with `INSUFFICIENT_HISTORY`, `LOW_DATA_CONFIDENCE`.
2. **Active Anomaly in Scope**: $\to \textbf{VERIFY}$ with `UNUSUAL_TRANSACTION`.
3. **Financial Stress**: $\to \textbf{INTERVENE}$ with `HIGH_EMI_BURDEN`, `DECLINING_SAVINGS`, or `RISING_EXPENSE_RATIO`.
4. **Healthy Trajectory**: $\to \textbf{RECOMMEND}$ with `HEALTHY_FINANCIAL_TREND`, `STABLE_INCOME`.
5. **Neutral / No Change**: $\to \textbf{NO\_ACTION}$ with `NO_MATERIAL_CHANGE`.

### 3.6 Multilingual Explanation Layer
- Supports **English (`en`)**, **Hindi (`hi`)**, and **Gujarati (`gu`)**.
- Uses deterministic templates for guaranteed offline functionality, zero hallucination, and sub-millisecond response times.
- Optional LLM integration via `LLM_API_KEY` behind a strict data-minimized safety boundary.
- **Prompt Injection Defense**: Raw transaction strings and untrusted user inputs are completely stripped before entering the explanation context.

---

## 4. API Endpoints

The service runs on port `8000` (FastAPI).

### `GET /health`
Returns service readiness and policy version.
```json
{
  "status": "healthy",
  "service": "intelligence",
  "version": "1.0.0",
  "policy_version": "v1.0"
}
```

### `POST /analyze`
Runs the complete intelligence pipeline and returns the canonical decision.
- **Input**: Analysis request containing customer, transactions, loans, consent, and analysis_scope.
- **Output**: JSON conforming to `shared/schemas/decision.schema.json`.

### `POST /financial-health`
Returns computed financial ratios and health context.
- **Output**: JSON conforming to `shared/schemas/financial-context.schema.json`.

### `POST /simulate`
Pure what-if simulation of a hypothetical loan.
- **Output**: `{ "current": FinancialHealth, "hypothetical": FinancialHealth, "decision": IntelligenceDecision }`.

### `POST /explain`
Translates structured decision facts into customer-friendly vernacular text (`en`, `hi`, `gu`).

---

## 5. Local Setup & Testing

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- `pip`

### Installation
```bash
cd intelligence
pip install -r requirements.txt
```

### Running the Test Suite
```bash
python -m pytest intelligence/tests -v
```

### Starting the Service
```bash
python -m uvicorn intelligence.src.main:app --host 0.0.0.0 --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

---

## 6. Backend Integration

The backend (`origin/backend:backend/src/services/intelligence.service.ts`) communicates with this service via HTTP at `http://localhost:8000`:
- `POST /analyze`
- `POST /financial-health`
- `POST /simulate`

When the service is running, the backend seamlessly routes live analysis through it instead of using fallback stubs.
