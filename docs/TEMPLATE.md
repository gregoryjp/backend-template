# Converting to a private GitHub template (and maintaining it)

## One-time: make it a template

1. Push this repository to a **private** GitHub repo (only with explicit authorization).
2. Repo → Settings → **Template repository** (checkbox). Anyone with access can then use "Use this template".
3. Secrets stay in `.env` (gitignored); the repo only carries `.env.example` / `.env.test.example`.

## Starting a new project

1. "Use this template" → new repo.
2. Clone, `cp .env.example .env` + `cp .env.test.example .env.test`, `docker compose up -d postgres`, `npm install`, `npm run db:deploy`.
3. `node scripts/init-project.mjs --name <project-name>` (validated; refuses on an already-initialized copy).
4. Feed the PRD through the flow in `skills/` and `AGENTS.md`.

## Versioning and maintenance

- Bump `package.json` with **semver**; keep `package-lock.json` committed for reproducible `npm ci`.
- Record user-visible changes in a `CHANGELOG.md` (create when the first PRD-driven change lands).
- Follow `skills/template-release.md` before tagging/releasing.

## Important: no automatic updates

Future projects created from this template **do not receive updates automatically**. To adopt template improvements, port them manually (or diff the two repos). Document each template release with an ADR when it changes a cross-cutting convention.

## Honest status

- Template tests green ≠ production-ready. Production readiness additionally depends on real deployment config: HTTPS/TLS termination, cookie `Secure` flag, CORS origins, SMTP credentials, secret management, DB backup/retention, and monitoring — none of which this template can assert for you.
