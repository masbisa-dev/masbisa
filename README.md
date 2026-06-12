# MASBISA 2.0

Full-stack workspace with a React frontend and a Django API backend.

## Project structure

```
masbisa/
├── backend/          # Django + DRF API (uv-managed Python)
├── frontend/         # React 19 + Vite + Tailwind CSS
├── docker-compose.yml
├── .mise.toml        # Tool versions (Node, pnpm, Python, uv)
└── README.md
```

## Tech stack


| Layer    | Stack                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, fetch API       |
| Backend  | Python 3.12, Django, Django REST Framework, PostgreSQL, uv             |
| Tooling  | [mise](https://mise.jdx.dev/) (Node 20, pnpm, Python 3.12, uv), Docker |


Auth packages (`django-allauth`, `dj-rest-auth`) are installed and configured in settings but auth endpoints are not exposed yet.

## Prerequisites

- [mise](https://mise.jdx.dev/) (recommended), or Node 20+, pnpm, Python 3.12+, and uv installed manually
- PostgreSQL 16+ (or compatible) installed on your system, **or** [Docker](https://www.docker.com/) if you prefer running PostgreSQL in a container
- Git

## Getting started

### 1. Install tools with mise

From the repository root:

```bash
mise trust    # first time only, if mise asks to trust .mise.toml
mise install
```

This installs Node 20, pnpm, Python 3.12, and uv as defined in `.mise.toml`.

### 2. Set up PostgreSQL

Choose one of the following options.

#### Option A — Native/system PostgreSQL

Use a PostgreSQL service installed on your machine (default port **5432**).

**Linux**

Install and start PostgreSQL (examples for common distros):

```bash
# Fedora / RHEL
sudo dnf install postgresql-server postgresql
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Debian / Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Create the application user and database (run as the `postgres` superuser):

```bash
sudo -u postgres psql
```

```sql
CREATE USER masbisa WITH PASSWORD 'masbisa';
CREATE DATABASE masbisa OWNER masbisa;
```

**Windows**

1. Install PostgreSQL from the [official installer](https://www.postgresql.org/download/windows/) or run `winget install PostgreSQL.PostgreSQL`.
2. Ensure the PostgreSQL Windows service is running (default port **5432**).
3. Open **psql** (from the Start Menu) or pgAdmin and run the same SQL as above to create the `masbisa` user and database.

**Configure `DATABASE_URL`**

When using native PostgreSQL, set port **5432** in `backend/.env` (see step 3):

```env
DATABASE_URL=postgres://masbisa:masbisa@localhost:5432/masbisa
```

#### Option B — Docker

Start PostgreSQL via Docker Compose (host port **5433** maps to container port 5432):

```bash
mise run db:up
# or: docker compose up -d
```

The `db:up` and `db:down` mise tasks are commented out in `.mise.toml` by default; uncomment them if you want to use mise for the database lifecycle. `docker compose` works regardless.

Keep the default `DATABASE_URL` from `.env.example` (port **5433**) for this path.

Stop the container when finished:

```bash
mise run db:down
# or: docker compose down
```

### 3. Set up the backend

```bash
cd backend
uv sync
cp .env.example .env   # Windows: copy .env.example .env
```

If you use native PostgreSQL (Option A), edit `backend/.env` and set `DATABASE_URL` to port **5432** before migrating.

```bash
uv run python manage.py migrate
```

Or from the repo root:

```bash
mise run backend:sync
mise run backend:migrate
```

### 4. Install frontend dependencies

Frontend is a separate pnpm project:

```bash
cd frontend && pnpm install
```

On first install, pnpm may prompt you to approve native builds (e.g. msw). Run `pnpm approve-builds` in the frontend directory if prompted.

### 5. Run the development servers

Use two terminals, or the VS Code **Full Stack** launch configuration.

Backend (default port 8000):

```bash
mise run backend:dev
# or: cd backend && uv run python manage.py runserver 8000
```

Frontend (Vite default, usually [http://localhost:5173](http://localhost:5173)):

```bash
cd frontend && pnpm dev
```

Open the frontend URL in your browser. The UI calls `GET /api/health` and shows backend status when the API is running.

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:


| Variable               | Description                               | Default                                             |
| ---------------------- | ----------------------------------------- | --------------------------------------------------- |
| `SECRET_KEY`           | Django secret key                         | (required)                                          |
| `DEBUG`                | Enable debug mode                         | `True`                                              |
| `ALLOWED_HOSTS`        | Comma-separated hostnames                 | `localhost,127.0.0.1`                               |
| `DATABASE_URL`         | PostgreSQL connection URL                 | `postgres://masbisa:masbisa@localhost:5433/masbisa` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins for CORS | `http://localhost:5173`                             |


The default `DATABASE_URL` in `.env.example` targets Docker Compose on port **5433** (`5433` on the host maps to `5432` inside the container). For a native/system PostgreSQL install, use port **5432** instead. User, password, and database name should match your chosen setup (`masbisa` / `masbisa` / `masbisa` by default).

`.env` files are gitignored.

### Frontend


| Variable       | Description      | Default                 |
| -------------- | ---------------- | ----------------------- |
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |


Set in `frontend/.env` if you need to override the default during local dev or builds.

## API


| Method | Path          | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | Health check JSON |


Example response:

```json
{
  "status": "healthy",
  "workspace": "masbisa",
  "runtime": "Python 3.12 + Django"
}
```

## Scripts

### Backend (`backend/`)


| Command                                  | Description                 |
| ---------------------------------------- | --------------------------- |
| `uv sync`                                | Install Python dependencies |
| `uv run python manage.py migrate`        | Apply database migrations   |
| `uv run python manage.py runserver 8000` | Start dev server            |
| `uv run ruff check .`                    | Lint Python code            |


### mise tasks (repo root)


| Task                       | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| `mise run db:up`           | Start PostgreSQL via Docker (uncomment in `.mise.toml` first) |
| `mise run db:down`         | Stop PostgreSQL container (Docker only)                       |
| `mise run backend:sync`    | `uv sync` in backend                                          |
| `mise run backend:migrate` | Run Django migrations                                         |
| `mise run backend:dev`     | Start Django on port 8000                                     |


### Frontend (`frontend/`)


| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Vite dev server          |
| `pnpm build`   | Production build         |
| `pnpm preview` | Preview production build |
| `pnpm lint`    | Run ESLint               |


## Development notes

- The frontend reads the API base URL from `VITE_API_URL` (default `http://localhost:8000`). Keep the backend on that host/port during local dev, or update the env var.
- CORS is configured on the API for browser requests from the Vite dev server (`http://localhost:5173`).
- PostgreSQL can run natively (system install) or via `docker-compose.yml`. Match `DATABASE_URL` to your method: port **5432** for native, **5433** for Docker.
- Auth packages are installed for future login/session endpoints; no auth routes are wired yet.
- `frontend/README.md` is the default Vite template docs; this file is the source of truth for the whole repo.

