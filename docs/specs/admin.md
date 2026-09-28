# Spec: Admin

Requirements and acceptance for administrative operations.

## Requirements

- R1 Roles `USER` and `ADMIN`; authorization checked in the backend.
- R2 Paginated user listing, no password hashes.
- R3 Deactivate/reactivate users with an audit trail (actor, target, action, time — no secrets).
- R4 The last active admin cannot be deactivated.
- R5 Admin creation is an explicit, secure, auditable procedure (bootstrap script).
- R6 No default credentials; no self-registration as ADMIN.

## Acceptance (covered by `src/modules/admin/__tests__/`)

- `GET /users` and `PATCH /users/:id/status` require auth + `ADMIN` (401/403 otherwise).
- Listing is paginated and never contains password hashes.
- Deactivation → the user can no longer authenticate; reactivation restores access.
- Deactivating the last active admin → `409 LAST_ADMIN`.
- Each status change writes an `AuditLog` row.
- Elevation attempt (a USER calling admin routes) → 403; injecting `role` via `PATCH /api/users/me` is ignored.

## Admin bootstrap

`npm run admin:bootstrap -- --email <email> --password <password>` (validated, no defaults). Documented in the RUNBOOK.
