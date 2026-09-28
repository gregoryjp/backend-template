# Spec: Users

Requirements and acceptance for the self profile.

## Requirements

- R1 Authenticated user reads their own profile.
- R2 Editable fields are explicit: `name` only. Email change (with re-verification) is a PRD-driven extension, not enabled by default.
- R3 Mass assignment: unknown or privileged fields in the body are ignored.
- R4 A user cannot read or modify another user's private data.
- R5 Password hash and internal ids are never exposed.

## Acceptance (covered by `src/modules/users/__tests__/`)

- `GET /me` requires auth (401 without it) and returns the public projection.
- `PATCH /me` updates only `name`; an injected `role: "ADMIN"`, `email`, or `isActive` is ignored.
- No id-scoped profile route exists; the identity is always derived from the session.
