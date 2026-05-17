# MASBISA 2.0

Full-stack workspace with a React frontend and an Express 5 API backend, both written in TypeScript.

## Project structure

masbisa/
├── backend/ # Express 5 + TypeScript API
├── frontend/ # React 19 + Vite + Tailwind CSS
├── .mise.toml # Tool versions (Node, pnpm, Python, uv)
└── README.md

## Tech stack

| Layer    | Stack                                                          |
| -------- | -------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, Axios   |
| Backend  | Node.js, Express 5, TypeScript, CORS                           |
| Tooling  | [mise](https://mise.jdx.dev/) (Node 20, pnpm, Python 3.12, uv) |

Python and `uv` are configured via mise for future use; the app itself is currently Node-only.

## Prerequisites

- [mise](https://mise.jdx.dev/) (recommended), or Node 20+ and pnpm installed manually
- Git

## Getting started

### 1. Install tools with mise

From the repository root:

```bash
mise trust    # first time only, if mise asks to trust .mise.toml
mise install
```

This installs Node 20, pnpm, Python 3.12, and uv as defined in .mise.toml.

2. Install dependencies
   Backend and frontend are separate pnpm projects (each has its own package.json and lockfile):

```bash
cd backend && pnpm install
cd ../frontend && pnpm install
```

On first install, pnpm may prompt you to approve native builds (e.g. esbuild, msw). Run pnpm approve-builds in the relevant directory if prompted.

3. Run the development servers
   Use two terminals.
   Backend (default port 8000):

```bash
cd backend
pnpm dev
```

Frontend (Vite default, usually http://localhost:5173):

```bash
cd frontend
pnpm dev
```

Open the frontend URL in your browser. The UI calls http://127.0.0.1:8000/api/health and shows backend status when the API is running.

# Environment variables

Create `backend/.env` if you need to override defaults (optional):

```
PORT=8000
```

`.env` files are gitignored.

# API

| Method | Path          | Description       |
| :----- | :------------ | :---------------- |
| GET    | `/api/health` | Health Check JSON |

Example response:

```json
{
  "status": "healthy",
  "workspace": "masbisa",
  "runtime": "Node.js + TypeScript (Express 5)"
}
```

# Scripts

## Backend (backend/)

| Command      | Description                   |
| :----------- | :---------------------------- |
| `pnpm dev`   | Start API with hot reload     |
| `pnpm build` | Compile TypeScript to `dist/` |

## Frontend (frontend/)

| Command        | Description              |
| :------------- | :----------------------- |
| `pnpm dev`     | Vite dev server          |
| `pnpm build`   | Production build         |
| `pnpm preview` | Preview production build |
| `pnpm lint`    | Run ESLint               |

# Development notes

- The frontend health check is hardcoded to `http://127.0.0.1:8000`. Keep the backend on that host/port during local dev, or update the URL in `frontend/src/App.tsx` (or move it to a `VITE\_\*` env var when you add one).
- CORS is enabled on the API for browser requests from the dev server.
- `frontend/README.md` is the default Vite template docs; this file is the source of truth for the whole repo.
