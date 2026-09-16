# Drillr — engineering guide

## MVP scope

The first slice includes the dashboard, a persistent and collapsible sidebar, player list/detail/create/edit/archive flows, team selection, and settings. Assessments, goals, reviews, athletic tests, training, and exercise libraries remain follow-up work.

## Stack and structure

- `frontend/`: React + TypeScript + Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind-compatible tokens, local shadcn-style components, and Radix primitives.
- `backend/`: FastAPI, Pydantic v2 DTOs, SQLAlchemy, Alembic, and PostgreSQL-ready persistence.
- `docker-compose.yml`: local database, API, and production-like static frontend containers.
- Keep domain logic in the API and keep UI state separate from server state.

## Run locally

```bash
# frontend
cd frontend && npm install && npm run dev

# backend (SQLite demo mode)
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DEV_AUTH_BYPASS=true uvicorn app.main:app --reload --port 8000

# containerized stack
docker compose up --build
```

Copy `.env.example` to the relevant environment file. Never commit Clerk keys, JWT material, database credentials, or real player data.

## Authentication and authorization

- Clerk is the authentication provider. The frontend uses the publishable key; the API verifies the bearer JWT with Clerk's configured JWKS/public key.
- Do not use Clerk Organizations for the current product model. One account may own multiple separate application teams.
- Every domain query and mutation must be scoped by both `owner_user_id` (Clerk `sub`) and `team_id`. A client-supplied team ID is never trusted by itself.
- HTTP middleware handles correlation IDs, CORS, security headers, structured request logging, and uncaught errors. FastAPI dependencies handle token verification, authenticated-user context, team ownership, and permissions.
- `DEV_AUTH_BYPASS=true` is local-only and must never be enabled in staging or production.

## API and data rules

- Use Pydantic request/response schemas; do not expose SQLAlchemy models directly.
- Use SQLAlchemy for persistence and Alembic for revisioned PostgreSQL migrations. Prefer additive expand/contract migrations; use concurrent indexes where needed.
- Add indexes for ownership/team filters. Prefer archive/status changes over destructive deletes for player data.
- Return clear `401`, `403`, `404`, `409`, and `422` responses. Do not leak whether data exists across teams.
- Keep timestamps UTC and store `created_at`/`updated_at` consistently.

## Frontend rules

- Routes belong in React Router. TanStack Query owns server state; URL search/filter state belongs in the URL; local UI state stays local.
- Forms use React Hook Form + Zod. Validate at the boundary and show field-level errors.
- Use the local shadcn-style primitives in `frontend/src/components/ui`; extend them before introducing another UI system.
- The sidebar remains available on desktop, supports expanded/collapsed state, remembers the preference, exposes active-route state, and degrades to a mobile drawer with keyboard focus and Escape handling.
- Every async view needs loading, empty, error, and success states. Keep touch targets, focus rings, labels, keyboard navigation, and contrast accessible.
- Use responsive layouts for desktop, tablet, and mobile. Do not hide critical actions only behind hover.

## Logging, operations, and releases

- Emit structured JSON logs to stdout/stderr. Include `request_id`, `trace_id` when available, service, environment, method, path, status, duration, and pseudonymous user/team IDs.
- Never log JWTs, passwords, secrets, raw request bodies, or unnecessary personal data. Keep audit events separate from operational logs.
- Docker services need health checks and environment-specific secrets. The database must not be publicly exposed in production.
- CI must run formatting, linting, type checks, tests, authorization tests, migration checks, frontend build, dependency/security scans, and secret detection.
- Staging is isolated and uses synthetic/anonymized data. Production releases use immutable commit-SHA images, a migration job, smoke checks, backup/rollback procedures, and manual approval.

## Testing strategy

- Backend: use `pytest` for unit tests and API/integration tests, `pytest-cov` for coverage, and `httpx`/FastAPI TestClient for requests. Run integration tests against an isolated PostgreSQL database after applying Alembic migrations.
- Frontend: use Vitest, React Testing Library, `user-event`, `jsdom`, and MSW. Cover the sidebar, routing, team switching, TanStack Query states, Zod errors, dialogs, responsive behavior, keyboard navigation, and accessibility attributes.
- E2E: use Playwright/Chromium against an isolated frontend/API/PostgreSQL stack. Keep a short MVP smoke suite for login, team selection, player CRUD, team isolation, settings persistence, validation errors, API errors, and mobile drawer navigation.
- Every protected endpoint needs negative authentication/authorization coverage: missing/invalid token, foreign team, foreign player, and cross-team cache/query isolation.
- Test data must be synthetic and scoped per run. Do not use real Clerk accounts, production databases, player notes, JWTs, or secrets.
- CI gates: backend unit + integration, frontend component tests, API contract checks, migration checks on clean/populated PostgreSQL, frontend/container build, and E2E smoke before release.
- Target MVP coverage is at least 80% for auth/authz policies and core use cases. Flaky tests are tracked and fixed, not silently disabled.

Target commands once the runners are wired:

```bash
cd backend && pytest --cov=app --cov-report=term-missing
cd frontend && npm run test && npm run test:coverage
cd frontend && npm run test:e2e -- --project=chromium
```

## Definition of done

Before merging a feature, verify the affected API and UI paths, run the smallest relevant automated checks, test an unauthorized and cross-team request, and document any intentional shortcut with a follow-up issue.
