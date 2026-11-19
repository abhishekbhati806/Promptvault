# PromptVault 🗄️

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_PromptVault-7c3aed?style=for-the-badge)](https://promptvault-sooty-ten.vercel.app)
[![Stack](https://img.shields.io/badge/React_19_+_FastAPI-Supabase_+_Vercel-06b6d4?style=for-the-badge)](https://promptvault-sooty-ten.vercel.app)

Discover, save, score, and improve AI prompts for ChatGPT, Claude, Gemini, and every other LLM.

## 🌐 Live Demo

Visit the live app here: **[https://promptvault-sooty-ten.vercel.app](https://promptvault-sooty-ten.vercel.app)**

---

## ✨ Features

- **Community Prompt Library** — Search, filter across 8 categories, sort by newest/likes/title, one-click copy, and like prompts.
- **Personal Workspace** — Secure JWT authentication, create/edit/delete your own prompts, bookmark favorites, and track stats from your Dashboard.
- **AI Studio** — Built-in **Prompt Improver**, **Prompt Generator**, and **Prompt Scorer** (uses OpenAI when `OPENAI_API_KEY` is configured, with an instant heuristic engine fallback).
- **Admin Console** — Role-guarded overview of users and community prompts.
- **Responsive UI** — Polished dark interface tested across desktop and mobile viewports.

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + React Router
- **Backend:** FastAPI (Python 3.13)
- **Database:** Supabase PostgreSQL (with automatic in-memory starter fallback for zero-config local dev)
- **Hosting:** Vercel (SPA + Python serverless API)

## 💻 Local Development

1. Copy `.env.example` to `.env` and fill in any optional keys (works locally even without external credentials).
2. Install and start the backend:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --app-dir server --reload --port 8000
   ```
3. Install and start the frontend:
   ```bash
   npm --prefix client install
   npm --prefix client run dev
   ```

## 🚀 Deployment (Vercel + Supabase)

1. Run `supabase/migrations/20261119_init_promptvault_schema.sql` in your Supabase SQL Editor.
2. Set `ENVIRONMENT=production`, `JWT_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` (plus optional `OPENAI_API_KEY`) in your Vercel project's Environment Variables.
3. Deploy — `vercel.json` and `api/index.py` handle building `client/dist` and serving both `/api/*` and SPA routes automatically.
