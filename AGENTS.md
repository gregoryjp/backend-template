# AGENTS.md — Entry point

This repository is a **reusable backend template** (Node.js + Express + TypeScript + Prisma). It ships with a working, tested base (auth, users, admin, health) and the process to turn a PRD into shipped features.

Start here, then read `docs/STATE.md`.

## Hard rules

- Node.js ≥ 22, TypeScript strict, **no `any`**.
- Every module lives in `src/modules/<name>/{routes,controllers,services,repositories,schemas,types,__tests__,index.ts}`.
- Services never see Express `Request`/`Response`; controllers never touch Prisma.
- Modules import other modules **only through their `index.ts`** (enforced by `scripts/check-boundaries.mjs`).
- Never commit `.env`; secrets only ever appear in `.env.example`.
- Verify before closing any task: `npm run check` (typecheck + lint + boundaries + tests).
- No `git push`, no paid resources, no destructive DB actions without explicit authorization.

## Working protocol

1. Read `docs/STATE.md` and `docs/PROJECT_MAP.md`.
2. Check the git branch and local changes (`git status`).
3. Load only the relevant spec (`docs/specs/`) and skill (`skills/`).
4. Widen reading only when dependencies or risk require it.
5. Update `docs/STATE.md` (and any affected doc) when closing a task.

## Documentation map

| Doc | Purpose |
| --- | --- |
| `docs/TECH_STACK.md` | Current technical decisions |
| `docs/ARCHITECTURE.md` | Boundaries and responsibilities |
| `docs/PROJECT_MAP.md` | Index of modules and key paths |
| `docs/STATE.md` | Current work, next step, blockers |
| `docs/BACKLOG.md` | Tasks and dependencies |
| `docs/adr/` | Justified decisions |
| `docs/modules/<m>.md` | Contract and entry points per module |
| `docs/specs/` | Requirements and acceptance per feature |
| `skills/` | Reusable procedures (one canonical file each) |
| `agents/` | Role descriptions for the four agents |

## Agents

Roles are defined as Markdown in `agents/` (orchestrator, architect, implementer, reviewer). They are **descriptions, not executable agents**. Invoke a role through the environment's subagent capability (for example `spawn_agent` with `agent_type` "explore"/"general"), passing the role file, the task, and the bounded list of files. If no independent review capability exists, mark that state as pending — never present a self-review as an independent one.
