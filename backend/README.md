# HackOut'26 Backend

**AI-Powered Hyper-Personalized Banking for Bharat** — Backend service

REST API + PostgreSQL/Prisma + Intelligence Service orchestration

## Architecture

```
Customer Frontend / Bank Dashboard
          ↓
    REST API (Express)
          ↓
   PostgreSQL / Prisma
          ↓
   Intelligence Service
          ↓
   Responsible Decision
          ↓
  ┌───────┼───────┐
  ↓       ↓       ↓
Customer  Bank   Audit
Frontend  Dashboard Log
```

**Core principle:** ML understands → Policy decides → LLM explains

The backend owns orchestration, persistence, validation, and auditability.  
The intelligence service owns financial analysis, decision logic, and confidence scoring.

## Quick Start

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 14+
- npm

### Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode |
| `BACKEND_PORT` | `5000` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `INTELLIGENCE_URL` | `http://localhost:8000` | Intelligence service URL |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin for frontend |
| `BANK_DASHBOARD_URL` | `http://localhost:3001` | CORS origin for dashboard |
| `LLM_API_KEY` | — | Optional LLM API key |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npm test` | Run test suite |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset database (destructive) |
| `npm run lint` | Type check |

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health + DB status |

### Customer
| Method | Path | Description |
|---|---|---|
| GET | `/customers/:id` | Customer profile + consent |
| GET | `/customers/:id/transactions` | Paginated transactions |
| GET | `/customers/:id/loans` | Customer loans |
| GET | `/customers/:id/financial-health` | Financial context |

### Analysis & Decision
| Method | Path | Description |
|---|---|---|
| POST | `/customers/:id/analyze` | Run intelligence pipeline |
| GET | `/customers/:id/decision` | Latest decision |
| GET | `/customers/:id/audit` | Paginated audit log |

### Consent
| Method | Path | Description |
|---|---|---|
| GET | `/customers/:id/consent` | Current consent state |
| PUT | `/customers/:id/consent` | Update consent |

### Feedback & Simulation
| Method | Path | Description |
|---|---|---|
| POST | `/customers/:id/feedback` | Record feedback event |
| POST | `/customers/:id/simulate` | What-if loan simulation |

### Pagination

Paginated endpoints accept `?page=1&limit=20` and return:
```json
{
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```

### Response Format

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Intelligence Service

The backend calls the intelligence service at `INTELLIGENCE_URL` for:
- Financial analysis (`/analyze`)
- Financial health (`/financial-health`)
- Simulation (`/simulate`)

When the intelligence service is unavailable, a deterministic mock fallback produces valid decisions for demo reliability.

## Demo Data

Seeded customers:
- **C1001** — Aarav Patel (age 32, ₹75,000/mo income, active loan)
- **C1002** — Meera Sharma (age 24, ₹35,000/mo income, thin file)

21 synthetic transactions spanning June–September 2026, including a prompt-injection test payload in TX1017.

## Security

- Helmet HTTP headers
- CORS restricted to frontend + dashboard origins
- Request body size limited to 1MB
- Zod validation on all inputs
- No secrets in source code
- No stack traces in API responses
- Parameterized queries via Prisma
- Auth middleware boundary (placeholder, ready for JWT/session)
