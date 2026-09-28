# ADR-0002: Modular monolith by feature

**Status:** accepted
**Date:** 2026-09-28

## Context

The template must stay simple (one deployable) while keeping features replaceable and boundaries testable.

## Decision

A single Node/Express process, one PostgreSQL database, modules split by feature with fixed layers (`routes/controllers/services/repositories/schemas/types`). Cross-module access only via each module's `index.ts`, enforced by `scripts/check-boundaries.mjs`.

## Consequences

- No microservice/queue/Redis by default; those are added only when a PRD justifies them (and then as a module + infra).
- Fast local development, one test database, simple deployment.
- If a module outgrows the monolith, its `index.ts` contract is the seam to extract it.
