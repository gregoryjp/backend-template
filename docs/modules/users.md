# Module: users

## Contract

Mounted at `/api/users`.

| Route | Purpose |
| --- | --- |
| `GET /me` | own profile (never the password hash) |
| `PATCH /me` | edit the explicit editable fields only |

Editable fields: `name` only. Everything else is ignored — mass-assignment safe because the service maps only the allowlist, never the raw body. Email change (with re-verification) is a PRD-driven extension, not enabled by default.

## Entry points (`index.ts`)

- `usersRouter` — mounted at `/api/users`.
- `toPublicUser`, `PublicUser` — the shared projection used by `auth` and `admin`.

## Guarantees

- A user cannot read or modify another user's private data (no id-routed profile endpoints; `me` is resolved from the session).
- Email uniqueness conflicts surface as `409 EMAIL_TAKEN`.
