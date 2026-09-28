# Project map

Index of modules and the paths that matter. Summaries navigate; code and tests are the source of truth.

## Modules (`src/modules/`)

| Module | Mount | Public surface | Purpose |
| --- | --- | --- | --- |
| `health` | `/health` | `healthRouter` | liveness + readiness (also the layers example) |
| `auth` | `/api/auth` | `authRouter`, `requireAuth`, `requireRole`, `authService` | register/verify, login, sessions, refresh, password flows |
| `users` | `/api/users` | `usersRouter`, `toPublicUser`, `PublicUser` | own profile read/edit |
| `admin` | `/api/admin` | `adminRouter` | paginated user list, deactivate/reactivate, audit |

## Core

- `src/config/env.ts` — validated environment.
- `src/infrastructure/http/app.ts` — `createApp()`.
- `src/server.ts` — startup + graceful shutdown.
- `src/infrastructure/errors.ts` — error model + handlers.
- `src/infrastructure/logger.ts` — pino + pino-http (redaction).
- `src/infrastructure/database.ts` — Prisma singleton.
- `src/shared/security/password.service.ts` — Argon2id hashing.

## Tests and scripts

- `test/` — guarded harness (`loadTestEnv`, `db`, `globalSetup`, `setup`).
- `scripts/check-boundaries.mjs` — module boundary enforcement.
- `scripts/check-raw-sql.mjs` — forbids unsafe/interpolated SQL.
- `scripts/status.mjs` — `npm run status` / `npm run status:audit`.
- `scripts/admin-bootstrap.ts` — explicit admin creation.

## Data model

`prisma/schema.prisma` — `User`, `Session`, `EmailVerificationToken`, `PasswordResetToken`, `LegalConsent`, `AuditLog`; migrations in `prisma/migrations/`.

## Standards and roles

`docs/STANDARDS.md` (rules), `docs/MOBILE_PROFILE.md` (optional mobile), `docs/LEGAL.md` (compliance). Roles in `agents/` include `ux-mobile` (UI only). Skills in `skills/` include the five UI procedures (`navigation-review`, `list-and-pagination`, `screen-states`, `form-and-mutation`, `mobile-journey-test`).
