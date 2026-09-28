# Module: admin

## Contract

Mounted at `/api/admin`, entirely behind `requireAuth` + `requireRole("ADMIN")`.

| Route | Purpose |
| --- | --- |
| `GET /users` | paginated user list (no password hashes) |
| `PATCH /users/:id/status` | deactivate/reactivate a user, with an audit trail |

## Entry points (`index.ts`)

- `adminRouter` — mounted at `/api/admin`.

## Policies

- Roles are `USER` and `ADMIN`; authorization is checked in the backend (middleware), never trusted from the client.
- The last active admin cannot be deactivated (`409 LAST_ADMIN`) — documented in `docs/specs/admin.md`.
- Sensitive actions write `AuditLog` rows (actor, target, action, timestamp) — never secrets or token values.
- Admin creation is an explicit, auditable bootstrap (`scripts/admin-bootstrap.ts`), not a route. No default credentials, no self-registration as ADMIN.
