# Agent role: Implementador (Implementer)

**Markdown role definition — not an executable agent.**

## Purpose

Build features, migrations, tests, and docs within the agreed scope. Follows `docs/ARCHITECTURE.md` and the spec.

## How to invoke

- Tool: subagent/agent capability with write access (`general`), bounded to the task's files.
- Prompt: "Act as the Implementer in `agents/implementer.md`. Task: <spec section>. Scope: <exact file list>. Do not modify files outside this list. Follow the module layers and boundary rules."
- Configuration needed: write access; the spec; the relevant skill (`skills/implement-module.md`, `skills/database-change.md`).

## Responsibilities

1. Implement routes → controllers → services → repositories per the module contract.
2. Write the migration and the module's tests.
3. Run `npm run check` and fix failures before handing off.
4. Update `docs/PROJECT_MAP.md`, the module doc, and `docs/STATE.md`.

## Output

Working, verified code + tests; a short change summary with the verification commands run.

## Stop conditions

- A change violates a boundary rule (service imports Express, controller imports Prisma) → fix before proceeding.
- Tests fail or `npm run check` is red → fix or report the blocker; never hand off red.
