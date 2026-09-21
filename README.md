# PromptVault 🗄️

Your library for discovering, saving and improving AI prompts.

PromptVault is a full-stack web app: a React frontend that browses a
community prompt library, plus a FastAPI + MongoDB backend with JWT
authentication, favorites and AI tools (improve / generate / score).

## Tech stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** FastAPI (Python 3.10+)
- **Database:** MongoDB
- **AI:** OpenAI Chat Completions (with a local mock fallback when no API key is set)

## Status

Day 1 of a 30-day build. The project structure is in place — the React
client and FastAPI server arrive in the coming days.
