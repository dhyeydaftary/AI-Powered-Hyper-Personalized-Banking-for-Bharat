# Scenario Map (developer reference only)

This file is a **developer-only** guide to what each seeded customer is meant
to demonstrate. It is never read by the backend or the intelligence mock, and
none of these expectations are stored on the customer/transaction/loan
records themselves — decisions are computed from financial data at request
time, exactly like they would be for any other customer.

Computed against the mock decision engine
(`backend/src/services/intelligence.service.ts`), assuming default consent
(all scopes `true`):

| Customer | Persona | Loan | Intended scenario | Emergent decision |
|---|---|---|---|---|
| C1001 | Aarav Patel | L1001 (manageable, ~12% EMI ratio) | Originally written as "healthy → deteriorating" across June–Sept, plus a prompt-injection fixture on TX1017 | **VERIFY** — TX1017's ₹95,000 amount exceeds the 80%-of-income anomaly threshold, so the unusual-transaction check fires before the EMI/savings check ever runs. The "deteriorating → INTERVENE" trajectory the original seed comments describe is not actually reachable while TX1017 is present. Left as-is to avoid breaking `backend/tests/api.test.ts`, which asserts on TX1017 directly. See "Known issue" below. |
| C1002 | Meera Sharma | none | Cold-start / thin file | **NO_ACTION** — only 1 month of history |
| C1003 | Priya Nair | none | Healthy trajectory, disciplined saver | **RECOMMEND** |
| C1004 | Rohan Deshmukh | L1004 (high, ~37% EMI ratio) | Deteriorating trajectory: high EMI burden + rising expense ratio, no single anomalous transaction | **INTERVENE** (`HIGH_EMI_BURDEN`, `RISING_EXPENSE_RATIO`) |
| C1005 | Sana Iqbal | L1005 (manageable, ~7% EMI ratio) | Otherwise ordinary customer, one isolated large purchase | **VERIFY** (`UNUSUAL_TRANSACTION`) |
| C1006 | Kavya Menon | none | Conflicting signals: strong income + healthy savings + one unusual transaction | **VERIFY** — demonstrates the anomaly check taking precedence deterministically even for an otherwise clearly healthy profile |
| C1007 | Devika Rao | none | Ordinary, unremarkable, sufficient history — nothing to act on | **RECOMMEND** |

## Known issue: C1001 conflates two test purposes

`TX1017` (in `backend/prisma/seed.ts`) does double duty as both:
1. An "unusual transaction" fixture for the demo, and
2. The prompt-injection defense fixture (`description` contains an
   instruction-like string), asserted on directly by
   `backend/tests/api.test.ts`.

Per `docs/SECURITY_AND_PRIVACY.md` and the data-contract guidance this
project is built against, untrusted-text fixtures should be kept separate
from financial-scenario fixtures — mixing them means C1001 can never
cleanly demonstrate "deteriorating trajectory → INTERVENE" the way the
seed file's own comments describe, since the anomaly short-circuit always
wins first.

**Smallest recommended fix (not applied here, to avoid breaking the
existing test):** split TX1017 into two fixtures —
- keep a plain, non-injection "unusual transaction" (e.g. a large but
  ordinary-sounding transfer) on C1001 if a deteriorating-trend demo on
  this exact customer is still wanted, and
- move the prompt-injection string to its own dedicated fixture/customer
  (or use one of the new fixtures in
  `shared/mock-data/security-test-fixtures.json`), with
  `backend/tests/api.test.ts` updated to point at the new location.

This is a one-file, low-risk change whenever the team is ready to make it;
it was left out of this pass specifically to avoid touching an existing
passing test.
