# Testing

## Backend

Backend tests use pytest, FastAPI TestClient, httpx, and pytest-cov. The suite uses an isolated in-memory SQLite database for fast unit/API coverage and should also run against an isolated PostgreSQL service in CI after Alembic migrations.

    cd backend
    PYTHONPATH=. .venv/bin/pytest -q --cov=app --cov-report=term-missing

The MVP suite covers player CRUD, missing authentication, foreign-team isolation, skill configuration, soft archiving, assessment writes, current-score projection, and append-only history.

## Frontend

Vitest and React Testing Library cover pure utilities and the player radar accessibility surface. New component tests should verify loading, empty, error, success, validation, keyboard, and responsive states where applicable.

    cd frontend
    npm run lint
    npm run test
    npm run test:coverage

## End-to-end

Playwright starts the local FastAPI demo server and Vite frontend through frontend/playwright.config.ts. Chromium tests cover the dashboard-to-player flow, player creation, and sidebar collapse/expand behavior.

    cd frontend
    npm run test:e2e -- --project=chromium

E2E data is synthetic and local-only. The test environment uses DEV_AUTH_BYPASS and must never point at staging or production data.

## Release gate

CI should run backend tests, frontend lint/build/tests, migration checks on a clean and populated PostgreSQL database, dependency/security checks, secret detection, and the Playwright smoke suite before release approval. Protected endpoints require negative tests for missing/invalid authentication, foreign teams, foreign players, and cross-team cache/query isolation.
