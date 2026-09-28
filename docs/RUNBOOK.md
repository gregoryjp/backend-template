# RUNBOOK

Operations, migrations, recovery, and diagnosis.

## Migrations

- New schema change: edit `prisma/schema.prisma`, then `npm run db:migrate -- --name <verb>_<object>` (dev DB). Review the generated SQL before committing.
- Apply to an environment: `npm run db:deploy` (uses `DATABASE_URL`). Run this as a deploy step **before** the new app version starts — the app container does not migrate itself.
- Never hand-edit an applied migration; add a new migration instead.
- The test DB is migrated automatically by the test harness on `npm test`.

## Legal consent

- Mandatory consents at signup: `LEGAL_TERMS_REQUIRED`, `LEGAL_PRIVACY_REQUIRED` (default true).
- Versions recorded: `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_VERSION`, `LEGAL_MARKETING_VERSION` — the server records the configured version, never a client string.
- Missing consent → `400 LEGAL_CONSENT_REQUIRED`; no account is created.
- Actual terms/privacy text comes from the PRD; the template never ships placeholder legal text as if real. See `docs/LEGAL.md`.

## Admin bootstrap

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@example.com ADMIN_BOOTSTRAP_PASSWORD='...' npm run admin:bootstrap
```

- Omitting `ADMIN_BOOTSTRAP_PASSWORD` generates one and prints it once.
- Promoting an existing user reuses the account; creating a new one marks it verified.
- There is no route for promotion, and the last active admin cannot be disabled.

## Email

- Default `EMAIL_PROVIDER=console` prints emails to stdout (the local test server).
- For a real provider: `EMAIL_PROVIDER=smtp` with `SMTP_HOST/PORT/USER/PASS/FROM` (TLS via `SMTP_SECURE`).
- Optional local mailbox (UI): `docker compose --profile mail up -d mailpit`, then set `EMAIL_PROVIDER=smtp`, `SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_SECURE=false` and open http://localhost:8025.

## Diagnosis

- **Readiness vs liveness:** `/health/live` = process up; `/health/ready` = Postgres reachable. Map liveness to "restart", readiness to "route traffic".
- **Startup config errors:** the app fails fast with a readable list of invalid env vars.
- **Structured logs:** pino JSON on stdout; `LOG_LEVEL=debug` for more. Sensitive fields (passwords, tokens) are redacted.
- **Request ID:** every request/response carries an `X-Request-Id` (echoed in error bodies) — correlate logs with `requestId`.
- **Rate limiting:** auth endpoints use a fixed window (`AUTH_RATE_LIMIT_WINDOW_MS` / `AUTH_RATE_LIMIT_MAX`); 429 = `TOO_MANY_REQUESTS`.

## Recovery

- **Lost access / disabled account:** re-run the admin bootstrap for the email (re-enables and re-verifies as ADMIN), or reactivate via the admin API.
- **Reset dev DB:** `npm run db:reset` (destructive; dev only).
- **Locked migrations in dev:** `npm run db:reset` if the migration ledger is inconsistent locally.

## Graceful shutdown

`SIGINT`/`SIGTERM` closes the HTTP server first, then disconnects PostgreSQL, then exits. A 10s force-exit guards against a connection that never drains.

## Environment reference

See `.env.example` — all values are validated at startup by `src/config/env.ts`. Never put secrets in `.env.example` or in the repo.
