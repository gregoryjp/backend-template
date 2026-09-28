# Module: health

## Contract

- `GET /health/live` → `200 { status: "ok" }` — process is up (no dependencies checked).
- `GET /health/ready` → `200 { status: "ok" }` when PostgreSQL is reachable; `503 { status: "unavailable" }` otherwise.

Semantics: **liveness** = should not be restarted; **readiness** = may receive traffic. These are documented so orchestrators map them correctly.

## Entry points (`index.ts`)

- `healthRouter` — Express router to mount at `/health`.

## Layers

- `routes/` → `controllers/` → `services/` → `repositories/` (a `SELECT 1` readiness check).
- Serves as the canonical example of the module layer structure.
