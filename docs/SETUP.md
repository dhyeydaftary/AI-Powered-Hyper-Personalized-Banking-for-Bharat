# Local Setup

## Prerequisites
- Git
- Node.js
- npm
- PostgreSQL
- Python 3.x for intelligence services
- chosen frontend runtime/framework

## Clone
```bash
git clone <REPOSITORY_URL>
cd AI-Powered-Hyper-Personalized-Banking-for-Bharat
```

## Branches
```bash
git fetch origin
git checkout dev
git pull origin dev
```

## Environment
Copy:
```bash
cp .env.example .env
```

Never commit `.env`.

## Suggested services

Backend:
```text
localhost:5000
```

Intelligence:
```text
localhost:8000
```

Frontend:
```text
localhost:3000
```

Bank dashboard:
```text
localhost:3001
```

Ports can be changed in environment configuration.

## Integration
Backend should call the intelligence service through the documented contract.
Frontend should call backend APIs only; it should not connect directly to PostgreSQL.
Bank dashboard should call backend APIs only.
