# Drillr — engineering guide

## MVP scope

The first slice includes the dashboard, a persistent and collapsible sidebar, player list/detail/create/edit/archive flows, team selection, and settings. Assessments, goals, reviews, athletic tests, training, and exercise libraries remain follow-up work.

## Stack and structure

- `frontend/`: React + TypeScript + Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind-compatible tokens, local shadcn-style components, and Radix primitives.
- `backend/`: FastAPI, Pydantic v2 DTOs, SQLAlchemy, Alembic, and PostgreSQL-ready persistence.
- `docker-compose.yml`: local database, API, and production-like static frontend containers.
- Keep domain logic in the API and keep UI state separate from server state.

## Folder structure and code organization

Follow the modular structure described in the [FastAPI guide for bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/#another-module-with-apirouter) and the feature-oriented structure described in [How to structure a React App in 2025](https://ramonprata.medium.com/how-to-structure-a-react-app-in-2025-spa-ssr-or-native-10d8de7a245a).

### Backend

- Treat `backend/app/` as the application package. Keep `__init__.py` in every Python package and subpackage that is imported by the application.
- Keep `app/main.py` focused on application assembly: create the `FastAPI` instance, configure middleware, and include routers.
- Put reusable FastAPI dependencies in `app/dependencies.py` (or a dedicated `app/dependencies/` package when the module grows).
- Group HTTP endpoints by domain under `app/routers/`. Each router module exposes an `APIRouter` and owns the prefix, tags, common responses, and shared dependencies for that domain. `main.py` composes the routers with `include_router()`.
- Keep domain code separate from transport code: use dedicated packages for `models`, `schemas`, `services`, `repositories`, `config`, and `enums` as they become necessary. Request/response DTOs stay in Pydantic schemas; SQLAlchemy models are never returned directly.
- Keep imports consistent within each package and avoid circular imports by keeping dependency direction explicit: routers -> services -> repositories/models.
- Organize tests to mirror the `app/` package and keep router, service, repository, and authorization tests independently discoverable.

Example target shape (adapt it to the domain; do not create empty layers speculatively):

```text
backend/app/
├── __init__.py
├── main.py
├── dependencies.py
├── database.py
├── auth.py
├── config/settings.py
├── enums/{assessment,player,profile,skill}.py
├── models/{assessment,player,skill,team}.py
├── schemas/{assessments,dashboard,players,skills,teams}.py
├── repositories/{players,skills,teams}.py
├── services/{skill_service,team_service}.py
└── routers/{dashboard,health,players,skills,teams}.py
```

### Frontend

- Use `frontend/src/app/` for application bootstrap, root layout, providers, and React Router configuration. `main.tsx` should remain an entry point, not a feature implementation.
- Use `frontend/src/features/` for cohesive product capabilities. A page is a feature, but not every feature is a page; pages should compose feature modules without knowing their internal implementation details.
- Within a feature, use only the folders the feature needs: `views/` for components and styles, `hooks/` for feature hooks, `services/` for data access, `store/` for feature state, `utils/` for feature-scoped helpers, and `types/` for feature types and enums.
- Keep `frontend/src/shared/` feature-agnostic. Features may depend on shared code; shared code must not depend on a feature. Put reusable UI primitives, generic hooks, utilities, and cross-feature infrastructure there.
- In `services/`, separate a manager from a repository when the feature has business rules or transformations: the manager owns orchestration, validation, mapping, and error handling; the repository is the data-source boundary and should not contain business rules.
- Keep React Query/server state in feature services/hooks, URL state in the router/search params, and local UI state in the owning component or feature store.
- Keep component prop types next to the component when they are component-specific; put reusable feature types and enums in the feature's `types/` package.
- The current codebase uses `shared/components/{layout,ui}`, `shared/lib`, `shared/test`, `shared/theme.tsx`, `shared/styles.css`, and `shared/types`. Move existing files when a move clarifies ownership or removes a misleading boundary; do not add empty layers for cosmetic consistency.

Example target shape:

```text
frontend/src/
├── app/
│   ├── main.tsx
│   ├── providers.tsx
│   └── routes.tsx
├── features/
│   ├── dashboard/views/
│   ├── players/{components,views}/
│   ├── settings/{components,views}/
│   └── workspace/
└── shared/
    ├── components/{layout,ui}/
    ├── lib/
    ├── test/
    ├── theme.tsx
    ├── styles.css
    └── types/
```

### File size, declarations, and simplification principles

- Each source file must contain one primary class or declaration; when a file defines classes, it must define only one class. Do not put multiple unrelated classes in the same file.
- Keep every source file at or below 500 lines. Split by cohesive responsibility before reaching the limit; never split a file into arbitrary fragments just to satisfy the count.
- Enums belong in dedicated enum files/classes, grouped by domain or feature. Do not hide enums inside routers, services, components, or unrelated model/schema files.
- Apply DRY: centralize genuinely shared rules, constants, mappings, and dependencies; do not abstract code that is merely similar once.
- Apply YAGNI: implement only the behavior and layers required by the current product scope; avoid speculative abstractions, extension points, and empty folders.
- Apply KISS: prefer the simplest design that makes ownership and dependencies clear. Standard library/framework primitives take priority over custom infrastructure and unnecessary dependencies.
- These limits are quality guardrails, not a reason to create needless indirection. Every split, abstraction, or shared module must improve cohesion, reuse, or testability.

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
- Creation and edit forms use dedicated routes and full-page layouts. Do not use dialogs for creation or modification workflows; reserve dialogs for confirmations and short, non-form actions.
- Player profiles include personal, sport, physical, contact, availability, medical/injury, and staff-note fields; optional profile fields remain nullable.
- Use the local shadcn-style primitives in `frontend/src/shared/components/ui`; extend them before introducing another UI system.
- The sidebar remains available on desktop, supports expanded/collapsed state, remembers the preference, exposes active-route state, and degrades to a mobile drawer with keyboard focus and Escape handling.
- Every async view needs loading, empty, error, and success states. Keep touch targets, focus rings, labels, keyboard navigation, and contrast accessible.
- Use responsive layouts for desktop, tablet, and mobile. Do not hide critical actions only behind hover.

## System design

Drillr uses a calm operational coaching UI: warm neutral surfaces, ink text, one burnt-orange accent, editorial sans typography, and restrained elevation. The visual system is intentionally compact so the coach can scan the roster without dashboard noise.

| Token | Value | Usage |
| --- | --- | --- |
| `page-bg` | `#f6f5f1` | application canvas |
| `sidebar-bg` | `#f2f2ec` | persistent navigation surface |
| `surface` | `#fffefa` | cards, dialogs, inputs |
| `surface-muted` | `#eeeee8` | secondary controls and quiet backgrounds |
| `ink` | `#1d211d` | primary text and strong actions |
| `ink-muted` | `#7b817a` | secondary text |
| `line` | `#e5e4dc` | borders and dividers |
| `accent` | `#ec6a3d` | primary action and active emphasis |
| `accent-deep` | `#cf512d` | accent hover/text on light surfaces |
| `accent-soft` | `#fbe6db` | accent tint and focus background |

- Body type uses DM Sans; display headings use Space Grotesk, always with system fallbacks.
- All authored spacing and radius values must be multiples of `4px`. Base spacing unit is `4px`; cards use `16px`, controls use `8px`, and pills use `12px`. Circular avatars/dots may use the semantic `50%` value.
- Cards use a subtle tinted shadow only when elevation communicates hierarchy. Prefer borders, dividers, and whitespace for simple grouping.
- One accent family is used across the page. Do not introduce another saturated CTA color or generic gradient.
- `frontend/src/shared/theme.tsx` is the reusable React theme provider. All color values, status colors, overlays, and shadows are defined in the exported `drillrTheme` constant; components consume CSS variables (`--ink`, `--surface`, `--accent`, etc.) instead of duplicating hex/rgba values.
- Extend the theme token map before adding a new color, radius, font, or shadow. Keep component-specific exceptions rare and documented.
- Responsive behavior is explicit: desktop uses a visible sidebar, tablet uses the compact rail, and mobile uses the persistent top bar plus drawer. The collapsed desktop sidebar must always expose its expand control.

### Accessibility and contrast

- Follow WCAG 2.2 AA as the baseline for every screen and reusable component.
- Normal text must reach a contrast ratio of at least `4.5:1`; large text at least `3:1`.
- Borders, focus indicators, controls, and meaningful non-text UI graphics must reach at least `3:1` against adjacent colors where WCAG requires non-text contrast.
- Never communicate state through color alone: pair status color with text, icon, label, or shape.
- Every interactive control needs a visible focus state, an accessible name, keyboard operation, and an appropriate semantic element/ARIA attribute.
- Forms require labels, field-level errors, error association, and clear success/failure feedback. Dialogs and mobile drawers must manage focus and support Escape.
- Preserve readable text at zoom/reflow, support responsive layouts, and respect `prefers-reduced-motion` for non-essential animation.

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

## Skill framework and assessment history

- The default player framework contains three Attack parameters: Disc skills, Movement & spacing, and Decision making.
- It contains three Defense parameters: Man marking, Zone marking, and Game reading.
- Coaches can add, edit, reorder, and archive parameters per team from Settings. Archiving is a soft operation so historical ratings remain readable.
- Assessment and review writes are append-only. The latest row per player and skill is the current radar value; older rows remain in the timeline.
- Every skill and assessment query must verify both owner_user_id and team_id, and every score must be validated by Pydantic at the API boundary on a 1..10 scale in 0.5 increments.
- The player detail page shows the radar only; exact values are available through point hover/focus labels and the dedicated snapshots route. The radar must not communicate category or status through color alone.
