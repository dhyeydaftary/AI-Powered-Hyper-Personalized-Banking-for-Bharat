# HackOut'26 — AI-Powered Hyper-Personalized Banking for Bharat

## Purpose
This repository foundation is the shared contract for all four development branches:

- `intelligence` — AI/ML + financial intelligence + decision engine
- `backend` — API + PostgreSQL/Prisma + orchestration
- `frontend` — customer experience
- `bank-dashboard` — RM/bank governance experience

## Core product principle
ML understands. Policy decides. LLM explains.

The LLM must never independently decide credit, fraud, eligibility, or the customer action.

## Four possible decisions
1. `RECOMMEND`
2. `INTERVENE`
3. `VERIFY`
4. `NO_ACTION`

## Source of truth
Before changing an interface, update the relevant document in `docs/` and the JSON schema in `shared/schemas/`.

## Branch rules
- `main` = stable integrated build
- `dev` = shared integration/foundation branch
- feature/module branches = implementation work
- Never force-push `main` or `dev`
- Do not silently change API response shapes

## Development order
1. Pull `dev`
2. Read `docs/ARCHITECTURE.md`
3. Read `docs/API_CONTRACT.md` and `docs/DATA_CONTRACT.md`
4. Use the shared mock data
5. Implement only your owned module
6. Test against the shared contracts
7. Merge module work into `dev`
8. Promote tested `dev` changes to `main`

## Privacy
Prototype uses synthetic customer data only. Do not commit real financial information, credentials, API keys, `.env` files, or production customer data.
