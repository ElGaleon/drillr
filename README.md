# Drillr

Base MVP dell’applicativo di coaching: dashboard, gestione giocatori, selezione di più team separati e impostazioni.

## Avvio rapido

### Demo locale

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DEV_AUTH_BYPASS=true uvicorn app.main:app --reload --port 8000
```

In un secondo terminale:

```bash
cd frontend
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173). In assenza di `VITE_CLERK_PUBLISHABLE_KEY` viene mostrata la modalità demo; l’API crea un workspace e una rosa sintetici per `demo_user`.

### Docker Compose

```bash
DEV_AUTH_BYPASS=true docker compose up --build
```

Lo stack avvia PostgreSQL, API FastAPI e frontend statico Nginx. Per usare Clerk, valorizza `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_KEY` e `CLERK_ISSUER` nel file `.env`, quindi disattiva `DEV_AUTH_BYPASS`.

## MVP incluso

- Dashboard con KPI della rosa e giocatori recenti.
- Sidebar sempre disponibile su desktop, espandibile/collassabile e drawer responsive su mobile.
- Lista giocatori con ricerca, filtro stato, creazione, modifica, archivio tramite stato e dettaglio.
- Più team per account, con dati separati tramite `owner_user_id` + `team_id`.
- Impostazioni del team attivo e documentazione auth/authz.
- FastAPI + Pydantic v2 + SQLAlchemy + Alembic, PostgreSQL-ready.
- Clerk predisposto come provider di autenticazione; bypass demo solo in locale.

## Note di progetto

Le best practice operative e la strategia di test backend/frontend/E2E sono in [AGENTS.md](AGENTS.md). La migrazione iniziale è in `backend/alembic/versions/0001_initial.py`; in Docker viene applicata prima dell’avvio dell’API.
