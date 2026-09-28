# Backlog

Template scope (this repository). Future project work starts from `docs/specs/` and appends here.

## Template — done

- [x] CI workflow (`.github/workflows/ci.yml`) with isolated PostgreSQL.
- [x] Dockerfile for the app (non-root user).
- [x] README (from-zero setup) and RUNBOOK (migrations, recovery, diagnosis).
- [x] Project-name initialization script (validated, non-destructive).
- [x] Template → private GitHub template + versioning guide.
- [x] OpenAPI contract (`docs/openapi/openapi.yaml`) and Bruno collection (`bruno/`).
- [x] Optional local mail server (mailpit) Compose profile.
- [x] Engineering & UX standard, mobile profile, and legal/compliance docs.
- [x] UX/Mobile role and five UI skills (navigation, list/pagination, screen states, form/mutation, mobile journey).
- [x] Legal consent at registration (versioned, config-driven).
- [x] Raw-SQL guard and status/audit scripts.

## Template — open

- [ ] Independent review of the template itself (marked pending in `docs/STATE.md`).
- [ ] `CHANGELOG.md` (create when the first PRD-driven change lands).

## Example PRD

- [x] PRD-intake → implement → verify flow documented and exercised once against `docs/specs/example-prd.md` in a throwaway copy.

## Dependency order

CI and Docker depend on the app building (`npm run build`). Docs and the init script are independent.
