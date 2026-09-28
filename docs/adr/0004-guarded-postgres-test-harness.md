# ADR-0004: Guarded PostgreSQL test harness

**Status:** accepted
**Date:** 2026-09-28

## Context

Integration tests must run against real PostgreSQL without ever touching development or production data.

## Decision

The harness (`test/`) resolves a dedicated `TEST_DATABASE_URL`, refuses to run unless the database name contains `test`, applies migrations, and truncates only the tables it created. It does not rely on "the URL contains the word test" alone — it verifies the database name suffix and refuses a known non-test host pattern.

## Consequences

- Tests create isolated fixtures (unique emails) and destroy only what they created via truncation of schema tables.
- A future shared CI database must be named `*_test` to be accepted.
