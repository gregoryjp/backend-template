# ADR-0003: Argon2id and rotating refresh tokens

**Status:** accepted
**Date:** 2026-09-28

## Context

Passwords must be hashed with a memory-hard algorithm; refresh tokens need a documented reuse/concurrency policy.

## Decision

- Passwords: **Argon2id** via `@node-rs/argon2`, `m=19456 KiB, t=2, p=1`.
- Refresh: one-time, rotated each use; on reuse, revoke the entire session family (all sessions of that user's session group) and force re-login.
- Verification/recovery tokens: one-time, hashed at rest (not stored in plaintext), with short expiry.

## Consequences

- Argon2id costs are tuned for a typical server; expose the cost params in config so deployments can adjust.
- Concurrent refresh (two parallel requests with the same token) resolves to exactly one success; the loser is a reuse event and revokes the family — documented in `docs/specs/auth.md`.
