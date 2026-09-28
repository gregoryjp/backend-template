# Architecture

A **modular monolith** organized by functionality. One process, one database, clear module boundaries.

## Layers per module

```
src/modules/<name>/
  routes/          HTTP routes + middleware composition
  controllers/     translate HTTP <-> use cases (parse, validate, respond)
  services/        business rules + transaction coordination
  repositories/    data access (Prisma)
  schemas/         input validation (Zod)
  types/           contracts
  __tests__/       behaviour
  index.ts         the module's public interface
```

## Boundary rules (enforced by `scripts/check-boundaries.mjs`)

- **Services** must not import Express `Request`/`Response`.
- **Controllers** must not import Prisma.
- **Cross-module imports** go only through the target module's `index.ts`.
- No generic repositories or abstractions without a concrete need.

## Shared and infrastructure

- `src/shared/` — cross-cutting pure utilities (e.g. `security/password.service.ts`).
- `src/config/env.ts` — validated configuration (fails fast on boot).
- `src/infrastructure/` — logger, errors, request-id, database, HTTP app/server, middleware.

## App lifecycle

- `createApp()` (`src/infrastructure/http/app.ts`) assembles the app with no side effects on the port.
- `src/server.ts` binds the port and owns graceful shutdown (HTTP first, then PostgreSQL).
- Health: `GET /health/live` (process up) and `GET /health/ready` (database reachable).

## Error model

`AppError(statusCode, code, message, details?)` plus a terminal `errorHandler`. `ZodError` → `400 VALIDATION_ERROR`. Unknown errors → `500 INTERNAL_ERROR` (logged, generic body, no leakage).

## Adding a module

1. Create `src/modules/<name>/` with the layer folders above.
2. Implement, and export the router + contracts from `index.ts`.
3. Mount the router in `src/infrastructure/http/app.ts`.
4. Write tests; update `docs/PROJECT_MAP.md`, `docs/STATE.md`, and add `docs/modules/<name>.md`.
