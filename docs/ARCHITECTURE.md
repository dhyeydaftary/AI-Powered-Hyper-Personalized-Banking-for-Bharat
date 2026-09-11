# System Architecture

## High-level flow

Authorized Customer Data
        ↓
Consent & Governance
        ↓
Feature Engineering
        ↓
Financial Context
        ├── Behavioral Trend Analysis
        └── Anomaly Analysis
        ↓
Decision & Policy Engine
        ↓
Action Selection
        ↓
Structured Decision
        ├── Customer Frontend
        └── Bank Dashboard
        ↓
LLM Explanation / Vernacular Conversation
        ↓
Feedback Capture + Audit Log

## Responsibilities

### Intelligence
Owns:
- financial ratios
- trend analysis
- anomaly analysis
- confidence scoring
- cold-start handling
- decision policy
- reason codes

### Backend
Owns:
- REST APIs
- database
- validation
- authentication/session layer
- orchestration
- persistence
- audit/feedback endpoints

### Frontend
Owns:
- customer dashboard
- financial health
- copilot
- recommendation/intervention/verification/no-action surfaces
- consent center
- what-if simulator

### Bank Dashboard
Owns:
- relationship-manager view
- decision history
- reason codes
- confidence
- suppressed recommendations
- audit visibility
- governance/security demonstrations

## Critical architectural rule
The LLM receives only sanitized structured decision data. It does not receive raw transaction descriptions when generating the explanation and it does not make the underlying decision.

## Data assumptions
The customer view is partial and uncertain. Missing history must reduce confidence and make the system more conservative.
