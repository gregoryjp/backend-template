# Tech stack

Current, verified decisions. Change any of these via an ADR in `docs/adr/`.

| Concern | Choice |
| --- | --- |
| Runtime | Node.js ≥ 22 (ESM, `"type": "module"`) |
| Language | TypeScript 5.9 — `strict`, no `any`, `noUncheckedIndexedAccess` |
| HTTP | Express 5.2 |
| Database | PostgreSQL 16 (Docker), Prisma 6 ORM (`prisma-client-js` generator) |
| Validation | Zod 3 |
| Password hashing | `@node-rs/argon2` — Argon2id (m=19456 KiB, t=2, p=1) |
| Auth | Opaque bearer access token + rotating refresh token (HttpOnly, SameSite=Strict cookie) |
| Email | `nodemailer` (SMTP) + a `console` adapter (default) |
| Logging | pino + pino-http (sensitive-field redaction) |
| Security | helmet, cors (explicit origins), express-rate-limit |
| Tests | Vitest 5 + Supertest 7 against a real, guarded Postgres test DB |
| Lint / format | Biome 2 |
| Dev runner / build | `tsx` in dev, `tsc` → `dist/` for production |
| CI | GitHub Actions with an isolated PostgreSQL |

## Why these

- **Express 5** — current stable; native async error forwarding (no `asyncHandler` wrapper).
- **Prisma 6** — stable, typed, migration-first. (Prisma 7's generator changes are a deliberate non-adoption until it is the proven default.)
- **Zod 3** — battle-tested API. A move to Zod 4 is a per-PRD decision, not a template default.
- **Opaque tokens, not JWT** — server-side revocability by design (logout, logout-all, disabled accounts) without a denylist.
- **Vitest + Supertest + real Postgres** — integration tests exercise real HTTP and real persistence; mocks are reserved for unit boundaries.

## Adding capabilities (only when a PRD justifies them)

Redis/queues, websockets, background jobs, file storage, and similar are **not included by default**. Add them as a new module plus infrastructure, with an ADR, when the PRD requires them. See `docs/ARCHITECTURE.md`.
