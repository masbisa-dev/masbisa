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

| Layer    | Stack                                                                 |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, fetch API    |
| Backend  | Python 3.12, Django, Django REST Framework, PostgreSQL, uv           |
| Tooling  | [mise](https://mise.jdx.dev/) (Node 20, pnpm, Python 3.12, uv), Docker |

Auth packages (`django-allauth`, `dj-rest-auth`) are installed and configured in settings but auth endpoints are not exposed yet.

## Prerequisites

- [mise](https://mise.jdx.dev/) (recommended), or Node 20+, pnpm, Python 3.12+, and uv installed manually
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- Git

## Getting started

### 1. Install tools with mise

From the repository root:

```bash
mise trust    # first time only, if mise asks to trust .mise.toml
mise install
```

This installs Node 20, pnpm, Python 3.12, and uv as defined in `.mise.toml`.

### 2. Start PostgreSQL

```bash
mise run db:up
# or: docker compose up -d
```

### 3. Set up the backend

```bash
cd backend
uv sync
cp .env.example .env   # Windows: copy .env.example .env
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

Frontend (Vite default, usually http://localhost:5173):

```bash
cd frontend && pnpm dev
```

Open the frontend URL in your browser. The UI calls `GET /api/health` and shows backend status when the API is running.

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

| Variable              | Description                                      | Default                                              |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `SECRET_KEY`          | Django secret key                                | (required)                                           |
| `DEBUG`               | Enable debug mode                                | `True`                                               |
| `ALLOWED_HOSTS`       | Comma-separated hostnames                        | `localhost,127.0.0.1`                                |
| `DATABASE_URL`        | PostgreSQL connection URL                        | `postgres://masbisa:masbisa@localhost:5433/masbisa`  |
| `CORS_ALLOWED_ORIGINS`| Comma-separated frontend origins for CORS      | `http://localhost:5173`                              |

`.env` files are gitignored.

### Frontend

| Variable       | Description              | Default                  |
| -------------- | ------------------------ | ------------------------ |
| `VITE_API_URL` | Backend base URL         | `http://localhost:8000`  |

Set in `frontend/.env` if you need to override the default during local dev or builds.

## API

| Method | Path          | Description       |
| :----- | :------------ | :---------------- |
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

| Command                                      | Description                          |
| :------------------------------------------- | :----------------------------------- |
| `uv sync`                                    | Install Python dependencies          |
| `uv run python manage.py migrate`            | Apply database migrations            |
| `uv run python manage.py runserver 8000`     | Start dev server                     |
| `uv run ruff check .`                        | Lint Python code                     |

### mise tasks (repo root)

| Task                  | Description                    |
| :-------------------- | :----------------------------- |
| `mise run db:up`      | Start PostgreSQL via Docker    |
| `mise run db:down`    | Stop PostgreSQL container      |
| `mise run backend:sync`    | `uv sync` in backend      |
| `mise run backend:migrate` | Run Django migrations     |
| `mise run backend:dev`     | Start Django on port 8000 |

### Frontend (`frontend/`)

| Command        | Description              |
| :------------- | :----------------------- |
| `pnpm dev`     | Vite dev server          |
| `pnpm build`   | Production build         |
| `pnpm preview` | Preview production build |
| `pnpm lint`    | Run ESLint               |

## Development notes

- The frontend reads the API base URL from `VITE_API_URL` (default `http://localhost:8000`). Keep the backend on that host/port during local dev, or update the env var.
- CORS is configured on the API for browser requests from the Vite dev server (`http://localhost:5173`).
- PostgreSQL runs in Docker via `docker-compose.yml`. Stop it with `mise run db:down`.
- Auth packages are installed for future login/session endpoints; no auth routes are wired yet.
- `frontend/README.md` is the default Vite template docs; this file is the source of truth for the whole repo.
