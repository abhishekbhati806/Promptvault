# PromptVault — AI Prompt Library

[![Live Demo](https://img.shields.io/badge/Live_Demo-promptvault--sooty--ten.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://promptvault-sooty-ten.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=0b1020)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](./LICENSE)

> **Live App:** **[https://promptvault-sooty-ten.vercel.app](https://promptvault-sooty-ten.vercel.app)** — open in any browser to browse, search, copy, improve, generate, score, save, and publish AI prompts.

**PromptVault** is a production-hardened, full-stack web application for discovering, crafting, evaluating, and organizing reusable AI prompts across **Writing, Coding, Business, Marketing, Education, Creative, Productivity, and General** workflows.

---

## Key Features

- **Curated Prompt Library** — Instant search, category filtering, difficulty badges (`beginner` / `intermediate` / `advanced`), sorting (`newest`, `likes`, `title`), atomic likes, and one-click copy.
- **Full Prompt Lifecycle** — Authenticated users publish, edit, and delete their own prompts with strict owner-level authorization.
- **Bookmarks & Workspace Dashboard** — Save favorite prompts across devices and inspect personal/library analytics in `/dashboard`.
- **AI Prompt Studio** — **Improve**, **Generate**, and **Score (0–10)** prompts using OpenAI (`OPENAI_API_KEY`) with a zero-config deterministic engine built in when no API key is set.
- **Admin Moderation** — Role-guarded admin panel (`/admin`) for platform metrics, featuring prompts, and moderating submissions.
- **Defense-in-Depth Security** — `bcrypt` password hashing with timing-safe login, `PyJWT` tokens, HTTP security headers (CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), per-IP sliding-window rate limiting, payload size caps, Supabase RLS, and database `CHECK` constraints (see [`SECURITY.md`](./SECURITY.md)).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Axios, Vite 8 |
| **Backend** | Python 3.13, FastAPI, Pydantic v2, PyJWT, bcrypt |
| **Database** | Supabase PostgreSQL (RLS + PostgREST + atomic SQL RPC) with automatic in-memory fallback for local dev/tests |
| **AI Studio** | OpenAI API (`gpt-4o-mini` configurable) + built-in heuristic engine |
| **Hosting & CI** | Vercel Serverless + Static SPA, GitHub Actions CI, Dependabot |

---

## Repository Structure

```text
Promptvault/
├── .github/
│   ├── dependabot.yml              # Weekly automated dependency security updates
│   └── workflows/ci.yml            # Backend (Ruff, Pytest, pip-audit) & Frontend (ESLint, Build, npm audit)
├── api/
│   └── index.py                    # Vercel Python serverless entrypoint
├── client/                         # React 19 + Vite single-page application
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── api/client.js           # Central Axios instance & auth headers
│   │   ├── components/             # Reusable UI components & ErrorBoundary
│   │   ├── context/                # AuthContext, ProtectedRoute & useAuth hook
│   │   ├── data/                   # Category metadata & offline fallback prompts
│   │   ├── pages/                  # Route views (Library, Auth, CRUD, Dashboard, AI Studio, Admin)
│   │   └── utils/                  # Token storage & display helpers
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                         # FastAPI backend
│   ├── middleware/
│   │   ├── rate_limit.py           # Per-IP sliding-window rate limiter & 64 KB body cap
│   │   └── security_headers.py     # CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, Cache-Control
│   ├── models/                     # User repository & prompt ID/timestamp helpers
│   ├── routers/                    # auth, prompts, favorites, stats, ai, admin
│   ├── schemas/                    # Strict Pydantic v2 validators (auth, prompt, ai)
│   ├── services/                   # security (bcrypt + PyJWT), supabase_db, ai_service
│   ├── tests/test_api.py           # Automated API, RBAC, IDOR, validation & security tests
│   ├── config.py                   # Fail-fast environment configuration
│   ├── dependencies.py             # Shared auth & admin FastAPI dependencies
│   ├── main.py                     # FastAPI app factory & traversal-safe SPA handler
│   ├── requirements.txt
│   └── seed.py                     # Curated starter prompts
├── supabase/migrations/
│   └── 20261119000000_init_schema.sql
├── .editorconfig
├── .env.example
├── LICENSE
├── SECURITY.md
├── pyproject.toml
├── requirements.txt
└── vercel.json
```

---

## API Overview

| Method & Endpoint | Auth | Description |
|---|---|---|
| `GET /api/health` | Public | Service & active database mode check |
| `POST /api/auth/register` | Public | Create account (8–72 char password, `bcrypt` hashed) |
| `POST /api/auth/login` | Public | Authenticate & issue `HS256` JWT |
| `GET /api/auth/me` | User | Fetch current authenticated profile |
| `GET /api/prompts` | Public | List prompts (`search`, `category`, `sort`, `skip`, `limit`) |
| `GET /api/prompts/{id}` | Public | Fetch single prompt by ID |
| `GET /api/prompts/mine` | User | List prompts created by current user |
| `POST /api/prompts` | User | Publish a new prompt |
| `PUT /api/prompts/{id}` | Owner | Update an owned prompt |
| `DELETE /api/prompts/{id}` | Owner | Delete an owned prompt |
| `POST /api/prompts/{id}/like` | Public | Atomically increment prompt like count |
| `GET /api/favorites` | User | List bookmarked prompts |
| `POST /api/favorites/{id}` | User | Bookmark a prompt |
| `DELETE /api/favorites/{id}` | User | Remove a bookmark |
| `GET /api/stats/dashboard` | User | Workspace & library statistics |
| `GET /api/ai/status` | Public | Report active AI mode (`openai` or `mock`) |
| `POST /api/ai/improve` | Public | Rewrite & improve a prompt |
| `POST /api/ai/generate` | Public | Generate a structured prompt from a topic |
| `POST /api/ai/score` | Public | Score a prompt out of 10 with actionable tips |
| `GET /api/admin/stats` | Admin | Platform-wide moderation metrics |
| `GET /api/admin/prompts` | Admin | List all prompts for moderation |
| `POST /api/admin/prompts/{id}/feature` | Admin | Toggle prompt featured badge |
| `DELETE /api/admin/prompts/{id}` | Admin | Delete any prompt |

---

## Local Development

### Prerequisites

- **Python** `3.11+` (`3.13` recommended)
- **Node.js** `20+` and `npm`

### 1. Clone & configure

```bash
git clone https://github.com/abhishekbhati806/Promptvault.git
cd Promptvault
cp .env.example .env
```

> Leave `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` empty to run instantly with built-in in-memory starter data.

### 2. Start the backend (`http://127.0.0.1:8000`)

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --app-dir server --reload --port 8000
```

Interactive OpenAPI docs are available at `http://127.0.0.1:8000/docs` in development mode.

### 3. Start the frontend (`http://127.0.0.1:5173`)

```bash
cd client
npm ci
npm run dev
```

Vite automatically proxies `/api/*` requests to `http://127.0.0.1:8000`.

---

## Testing, Linting & Security Audits

```bash
# Backend: lint, test suite, and dependency vulnerability audit
pip install -e ".[dev]"
ruff check server api
pytest
pip-audit -r requirements.txt

# Frontend: lint, production build, and dependency vulnerability audit
npm --prefix client run lint
npm --prefix client run build
npm --prefix client audit
```

---

## Deploying Your Own Instance (Vercel + Supabase)

1. **Supabase** — Create a free project and execute [`supabase/migrations/20261119000000_init_schema.sql`](./supabase/migrations/20261119000000_init_schema.sql) in the SQL Editor.
2. **Vercel** — Import this repository and set the following Environment Variables:
   - `ENVIRONMENT=production`
   - `JWT_SECRET` — strong random secret (`>= 32` characters)
   - `SUPABASE_URL` — your Supabase project URL (`https://<ref>.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (server-side only, never exposed to the browser)
   - `OPENAI_API_KEY` *(optional)* — enables live LLM responses in AI Studio
3. Deploy — `vercel.json` builds the React SPA into `client/dist/` and serves both the SPA and `/api/*` from FastAPI (`api/index.py`).

---

## Security & License

- Security architecture and vulnerability disclosure: [`SECURITY.md`](./SECURITY.md)
- Licensed under the [MIT License](./LICENSE) — Copyright (c) 2026 Abhishek Bhati.
