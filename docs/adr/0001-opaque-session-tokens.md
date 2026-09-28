# ADR-0001: Opaque session tokens instead of JWT

**Status:** accepted
**Date:** 2026-09-28

## Context

Auth needs sessions that can be revoked immediately (logout, logout-all, account deactivation) and a refresh token whose reuse must be detectable.

## Decision

Use **opaque, randomly generated tokens** stored server-side (hashed) in the `Session` table, not JWTs.

- Access token: short-lived (15 min), sent as `Authorization: Bearer`.
- Refresh token: long-lived (14 days), HttpOnly cookie, rotated on every use.
- Reuse detection: a refresh token is one-time; a reused token revokes the whole session family.

## Consequences

- Revocation is a DB delete/update — no denylist, no clock-skew logic.
- Requires a DB lookup per authenticated request (acceptable at this scale; cache later if a PRD demands it).
- No cross-service claims; if that becomes necessary, revisit with an ADR.
