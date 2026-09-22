# Application Structure and Conventions

This document adapts the [FastAPI multi-file application guidance](https://fastapi.tiangolo.com/tutorial/bigger-applications/) to the Drillr repository. The structure is organized around clear ownership boundaries and should be followed for new code.

## Backend FastAPI

FastAPI is composed from a package of focused modules. Routers define the HTTP contract, services coordinate domain behavior, repositories provide persistence access, and Pydantic schemas protect the API boundary. SQLAlchemy models are never exposed directly.

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # application composition and middleware
│   ├── auth.py                 # Clerk token verification and user context
│   ├── dependencies.py         # team/player authorization dependencies
│   ├── database.py             # engine, session, and declarative base
│   ├── config/settings.py      # environment-backed configuration helpers
│   ├── enums/                  # domain enums, one declaration per module
│   │   ├── assessment.py
│   │   ├── player.py
│   │   ├── profile.py
│   │   └── skill.py
│   ├── models/                 # SQLAlchemy persistence models
│   │   ├── assessment.py
│   │   ├── player.py
│   │   ├── skill.py
│   │   └── team.py
│   ├── schemas/                # Pydantic request/response DTOs
│   │   ├── assessments.py
│   │   ├── dashboard.py
│   │   ├── players.py
│   │   ├── skills.py
│   │   └── teams.py
│   ├── repositories/           # persistence access by aggregate
│   │   ├── players.py
│   │   ├── skills.py
│   │   └── teams.py
│   ├── services/               # domain logic and orchestration
│   │   ├── skill_service.py
│   │   └── team_service.py
│   └── routers/                # domain-oriented APIRouter modules
│       ├── dashboard.py
│       ├── health.py
│       ├── players.py
│       ├── skills.py
│       └── teams.py
└── tests/                      # tests organized by behavior and boundary
```

Dependency direction:

`routers -> services -> repositories/models`

`app/main.py` is limited to application composition, middleware, lifecycle setup, and router inclusion. This follows FastAPI's `APIRouter` pattern and keeps endpoint modules independently testable.

## Frontend React

The frontend is organized by feature. The `app` layer owns application bootstrap, providers, and routing. `shared` contains feature-agnostic infrastructure and reusable UI. Features own their views and feature-specific components.

```text
frontend/src/
├── app/
│   ├── main.tsx                # entry point
│   ├── providers.tsx           # global providers
│   └── routes.tsx              # React Router and auth gate
├── features/
│   ├── dashboard/views/        # dashboard screens
│   ├── players/
│   │   ├── components/         # player forms and radar
│   │   └── views/              # player list and detail screens
│   ├── settings/
│   │   ├── components/         # skill configuration forms
│   │   └── views/              # settings screens
│   └── workspace/              # active-team and workspace UI state
└── shared/
    ├── components/{layout,ui}/ # reusable components
    ├── lib/                    # API client and generic utilities
    ├── test/                   # global test setup
    ├── theme.tsx               # reusable theme provider
    ├── styles.css              # global styles and design tokens
    └── types/                  # shared, feature-independent types
```

`shared` must remain feature-agnostic: features may use `shared`, but `shared` must not import a feature. TanStack Query owns server state, URL state owns shareable filters, and local component state owns transient UI state. A feature store is introduced only when state must be shared across multiple feature components.

Creation and edit forms use dedicated routes and full-page layouts. Dialogs are reserved for confirmations, short actions, and non-form feedback; they must not contain creation or edit workflows.

Select controls use the shared Radix/shadcn-style Select primitive in `frontend/src/shared/components/ui/select.tsx`. Native HTML selects are not used for workspace switching, filters, profile fields, skill configuration, or assessments.

## File and declaration rules

- Every module has one primary responsibility and one clearly identifiable main declaration.
- Every source file stays below 500 lines; extract only when the extraction improves cohesion, reuse, or testability.
- Enums have dedicated files and are organized by domain or feature.
- Props used by one component stay next to that component; reusable types belong in a feature `types` folder or `shared/types` when genuinely cross-feature.

## DRY, YAGNI, and KISS

- **DRY** — centralize genuinely shared rules and avoid duplicated validation, mappings, constants, and dependencies.
- **YAGNI** — do not create layers or extension points until a concrete need justifies them.
- **KISS** — prefer framework and standard-library primitives when they keep responsibilities and data flow clear.

## Player skill framework

The MVP ships with six default evaluation parameters split between Attack and Defense. Coaches can add, edit, reorder, and archive parameters per team. Player ratings are stored as append-only assessment rows so reviews never overwrite historical context. Scores use a 1–10 scale with 0.5 increments. The player profile renders the latest values in a six-axis radar; hovering or focusing a radar point reveals its exact value, while the dedicated snapshots route exposes the score list, assessment form, and full timeline.

The backend uses Pydantic v2 DTOs for skill definitions, assessment payloads, score bounds, categories, and sources. SQLAlchemy models remain internal. Alembic revision `0002_skill_framework` creates the team-scoped skill and assessment tables with ownership, team, player, and history indexes.

## Player profile

The player profile is team-scoped and keeps personal, sport, physical, availability, and staff context together. The current profile fields are:

- Personal: first name, last name, preferred name, date of birth, gender, nationality, contacts, and optional profile photo URL.
- Sport: primary role, optional secondary role, jersey number, dominant hand, and training availability.
- Physical: optional height in centimetres and weight in kilograms.
- Operations: active/injured/inactive status, medical/injury notes, and staff notes.

All optional profile fields remain nullable so existing players and incomplete records remain valid. Migrations `0003_player_profile` and `0004_player_contact_and_availability` add the columns without rewriting existing data. Migration `0005_assessment_score_scale` changes assessment scores to a PostgreSQL/SQLite-compatible floating-point representation.

## Player detail layout

The player detail view keeps the page focused on the player: the title row contains the primary edit action aligned to the top right, the left column contains one consolidated information card, and the right column contains the radar. Snapshot history and assessment entry belong to `/players/:playerId/assessments`, keeping the overview compact while preserving the complete review workflow.
