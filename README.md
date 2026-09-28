# Backend Template

A reusable, tested backend base: **Node.js + Express + TypeScript + Prisma + PostgreSQL**, structured as a modular monolith. It ships working auth (email verification, revocable sessions, rotating refresh, password recovery/change), self profile, admin user management, health checks, and the process to turn a PRD into shipped features.

No business rules, no real data, no secrets. Start a new project from this, then feed it a PRD.

## Requirements

- Node.js ≥ 22 (see `.nvmrc`)
- Docker (for the local/test PostgreSQL)

## From zero

```bash
# 1. Environment (no secrets in the repo; examples only)
cp .env.example .env
cp .env.test.example .env.test

# 2. Start PostgreSQL (dev DB on :5433, test DB created automatically)
docker compose up -d postgres

# 3. Install and generate the Prisma client
npm install

# 4. Apply committed migrations to the dev database
npm run db:deploy

# 5. Run
npm run dev            # http://localhost:3000
```

Verify the API is alive:

```bash
curl http://localhost:3000/health/live   # {"status":"ok"}
curl http://localhost:3000/health/ready  # {"status":"ok"} when Postgres is reachable
```

## Create the first admin

No default credentials exist. Run the explicit, audited bootstrap (generates a password if you omit it — store it, it prints once):

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@example.com ADMIN_BOOTSTRAP_PASSWORD='change-me-strong' npm run admin:bootstrap
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start in watch mode (`tsx`) |
| `npm run build` | Compile to `dist/` (production emit) |
| `npm run start` | Run the compiled app from `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome check (src, test, scripts) |
| `npm run check:boundaries` | Enforce module boundaries |
| `npm run test` | Vitest + Supertest against the guarded test DB |
| `npm run check` | typecheck + lint + boundaries + tests (the full gate) |
| `npm run db:migrate` | Create/appl​y a dev migration |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:reset` | Reset the dev DB (destructive) |
| `npm run admin:bootstrap` | Create/promote the first admin |

## Testing

Tests run against a **dedicated** PostgreSQL database (`app_test`). The harness refuses to run unless `NODE_ENV=test` and the database name matches `TEST_DATABASE_NAME` — it never touches dev/prod data. It truncates only the tables it created, uses unique fixtures, and a controlled clock where expiry is involved (no arbitrary sleeps).

## Documentation

- `AGENTS.md` — entry point and working protocol.
- `docs/ARCHITECTURE.md` — boundaries and responsibilities.
- `docs/TECH_STACK.md` — current decisions.
- `docs/PROJECT_MAP.md` — module index.
- `docs/STATE.md` / `docs/BACKLOG.md` — current state and tasks.
- `docs/adr/` — decisions.
- `docs/modules/` — per-module contracts.
- `docs/specs/` — requirements and acceptance (incl. `example-prd.md`).
- `skills/` — reusable procedures.
- `agents/` — the four agent role descriptions.
- `docs/RUNBOOK.md` — operations, migrations, recovery, diagnosis.
- `docs/TEMPLATE.md` — turning this into a private GitHub template and versioning it.

## New project from a PRD

1. Copy this template, run `node scripts/init-project.mjs --name <name>`.
2. Run the flow: `skills/prd-intake.md` → `plan-feature` → `implement-module` / `database-change` / `api-contract` → `test-feature` → `security-review` → `review-change` → `project-handoff`.
3. Keep `docs/STATE.md` and `docs/BACKLOG.md` current.
