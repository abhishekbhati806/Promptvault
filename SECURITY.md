# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in **PromptVault**, please report it responsibly instead of opening a public issue:

1. Use GitHub's private vulnerability reporting on [`abhishekbhati806/Promptvault`](https://github.com/abhishekbhati806/Promptvault/security) or contact the maintainer directly via GitHub profile [`@abhishekbhati806`](https://github.com/abhishekbhati806).
2. Include clear reproduction steps, affected endpoint/component, and potential impact.
3. Avoid accessing, modifying, or deleting data belonging to other users while testing.

## Security Architecture & Controls

PromptVault applies defense-in-depth across the frontend, API, and database layers:

| Layer | Controls Implemented |
|---|---|
| **Authentication & Passwords** | `bcrypt` (cost factor 12, 72-byte safe ceiling), 8–72 char policy, constant-cost dummy verification on unknown emails to prevent timing enumeration. |
| **Tokens (JWT)** | `PyJWT` (`HS256`) with required `sub`, `iat`, `exp` claims, minimal PII-free payloads, fail-fast `>= 32` character `JWT_SECRET` enforcement in production, and random ephemeral secrets in local development. |
| **Authorization & Anti-IDOR** | Strict owner checks on prompt update/delete (`403 Forbidden`), role-guarded `/api/admin/*` endpoints, and `extra="forbid"` schemas blocking mass assignment (`featured`, `likes`, `owner_id`). |
| **Input & Query Safety** | Pydantic v2 length/enum/control-character validators, strict ID allowlist (`^[A-Za-z0-9_-]{1,64}$`) before PostgREST queries, XML-delimited prompt-injection boundaries on LLM calls, and `Path.is_relative_to()` traversal protection on SPA asset serving. |
| **Abuse & DoS Protection** | Sliding-window per-IP rate limiting (`429` + `Retry-After`) across auth, AI Studio, likes, and write routes; `64 KB` request body ceiling (`413 Payload Too Large`); bounded limiter memory. |
| **HTTP & Browser Security** | `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (prod), `Referrer-Policy`, `Permissions-Policy`, `Cache-Control: no-store` on private API routes, explicit CORS allowlists, OpenAPI docs disabled in production, disabled client source maps, React output escaping (zero `dangerouslySetInnerHTML`), and open-redirect validation on login flows. |
| **Database (Supabase PostgreSQL)** | Row Level Security (RLS) enabled on `users`, `prompts`, and `favorites`; `anon` and `authenticated` table/RPC privileges revoked; `SECURITY DEFINER` RPC pinned with `SET search_path = public`; server-only `SUPABASE_SERVICE_ROLE_KEY` over HTTPS; database-level `CHECK` constraints; generic `503` upstream error shielding. |
| **Supply Chain** | Zero known `npm audit` and `pip-audit` vulnerabilities, automated Dependabot checks (`.github/dependabot.yml`), and strict `.gitignore` / `.vercelignore` secret exclusions. |

## Supported Versions

| Version | Supported |
|---|---|
| `1.x` (`main` branch) | Yes |
| `< 1.0` | No |
