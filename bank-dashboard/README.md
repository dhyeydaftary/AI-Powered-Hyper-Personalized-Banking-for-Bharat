# Bank / Relationship Manager & Governance Dashboard

Internal decision intelligence, human oversight, and AI governance application for **AI-Powered Hyper-Personalized Banking for Bharat** (HackOut'26).

## Purpose & Core Principles

This dashboard is a **decision intelligence & governance surface**, not a generic admin template or marketing analytics page. It communicates one fundamental principle:

> **AI assists the bank. Humans remain accountable.**

Key features:
1. **Four Decision Outcomes**: Structured rendering of `RECOMMEND`, `INTERVENE`, `VERIFY`, `NO_ACTION`.
2. **Decision Inspector**: Highlighting confidence scores, deterministic reason codes, underlying financial signals, and policy version (`v1.0`).
3. **Human Review Queue**: Prioritizes low-confidence cases (&lt; 75%), `VERIFY` transaction anomalies, and `INTERVENE` stress cases.
4. **Deliberate Non-Intervention**: Dedicated view for `NO_ACTION` outcomes, showcasing ethical suppression when no clear customer benefit exists.
5. **Consent & Privacy Governance Matrix**: Transparent view of customer-authorized data scopes (`behavioral_trend_analysis`, `anomaly_analysis`, `vernacular_assistance`) and confidence impact.
6. **Immutable Audit Trail**: Append-only log of all historical AI decision events.
7. **Policy Transparency**: Rule specification inspection panel for financial stress thresholds and anomaly parameters.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Port**: `3001`
- **Design System**: Enterprise slate/navy/zinc aesthetic with Inter & JetBrains Mono typography. Zero vibe-code / 0 neon fluff.
- **Icons**: Lucide-React
- **Testing**: Vitest

---

## Architecture & Integration

The bank dashboard communicates with the backend via REST APIs:

```text
Bank Dashboard (Port 3001)
       │
       │ REST / JSON (`VITE_API_BASE_URL=http://localhost:5000/api/v1`)
       ▼
    Backend (Port 5000)
       │
       ▼
  Intelligence (Port 8000)
```

- **Mock Adapter Fallback**: When the backend is offline or `VITE_USE_MOCKS=true`, the dashboard seamlessly uses synthetic test fixtures for personas `C1001` through `C1007`.

---

## Local Setup & Development

### 1. Install Dependencies
```bash
cd bank-dashboard
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3001` in your browser.

### 3. Run Production Build
```bash
npm run build
```

### 4. Run Test Suite
```bash
npm test
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_USE_MOCKS=false
VITE_APP_ENV=development
```
