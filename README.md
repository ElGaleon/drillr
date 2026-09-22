# Drillr

MVP foundation for a coaching application: dashboard, player management, separate team selection, and settings.

## Quick start

### Local demo

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DEV_AUTH_BYPASS=true uvicorn app.main:app --reload --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). When `VITE_CLERK_PUBLISHABLE_KEY` is not set, demo mode is displayed; the API creates a synthetic workspace and roster for `demo_user`.

### Docker Compose

```bash
DEV_AUTH_BYPASS=true docker compose up --build
```

The stack starts PostgreSQL, the FastAPI API, and a static Nginx frontend. To use Clerk, set `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_KEY`, and `CLERK_ISSUER` in `.env`, then disable `DEV_AUTH_BYPASS`.

## Included in the MVP

- Dashboard with roster KPIs and recent players.
- Sidebar always available on desktop, expandable/collapsible, with a responsive mobile drawer.
- Player list with search, status filtering, creation, editing, status-based archiving, and detail views.
- Multiple teams per account, with data isolated through `owner_user_id` + `team_id`.
- Active team settings and authentication/authorization documentation.
- Coach-configurable skill framework with six default attack/defense parameters.
- Append-only assessment and review history, rendered as a player radar chart with 1–10 half-step scoring and a dedicated snapshots view.
- Full-page player profile creation/editing with personal, contact, sport, physical, availability, and medical context.
- FastAPI + Pydantic v2 + SQLAlchemy + Alembic, PostgreSQL-ready.
- Clerk configured as the authentication provider; demo bypass for local use only.
- Reusable system design in `frontend/src/shared/theme.tsx`, with color, typography, radius, spacing, and elevation tokens.

## Project notes

Operational best practices, backend/frontend folder structure, and the backend/frontend/E2E testing strategy are documented in [AGENTS.md](AGENTS.md) and [docs/architecture.md](docs/architecture.md). The initial migration is in `backend/alembic/versions/0001_initial.py`; Docker applies it before starting the API.

The system design documents the warm-neutral palette with a burnt-orange accent, DM Sans + Space Grotesk, spacing and radii in multiples of 4, responsive sidebar rules, and WCAG 2.2 AA contrast requirements. The React theme exposes `ThemeProvider`, `useTheme`, and `drillrTheme`: colors are defined in the theme constant and consumed through CSS variables, without hex/rgba values in components.

Creation and edit forms use dedicated routes and full-page layouts; dialogs are reserved for confirmations and short non-form actions.

## Structure and simplicity conventions

The backend follows the modular FastAPI organization: `app/main.py` assembles the application and includes domain-oriented `APIRouter` modules; dependencies, models, schemas, services, and repositories remain separate. The frontend follows a feature-oriented organization: `src/app` contains bootstrap, providers, and routing, `src/features` contains cohesive capabilities, and `src/shared` contains only reusable code independent of features.

For operational details and folder tree examples, see [docs/architecture.md](docs/architecture.md). As cross-cutting rules, each file has one primary class or declaration, must not exceed 500 lines, and enums live in dedicated files/classes. Code must follow DRY, YAGNI, and KISS, avoiding both duplication and premature abstraction.
