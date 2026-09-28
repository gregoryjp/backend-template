# Mobile profile (opcional)

This template ships **backend only**. This file is the *profile* that future projects adopt when a PRD requires a mobile client. **There is no implemented mobile experience in this repository** — do not claim one.

## Single navigation decision

Before writing a single screen, pick **one** navigation solution compatible with the chosen stack and document it in an ADR (`docs/adr/`). Do not mix navigation systems (e.g. two routers / two stacks) without a documented reason. The decision covers: typed routes, params, deep links, back handling, modals, and session-restore gating.

## Startup and session

- Cold start must not flash the wrong screen: resolve session state before rendering private content.
- Restored session that is invalid/expired → public/auth flow, without a visible bounce.
- Post-login, restore a pending destination only if still valid and authorized.

## Device permissions (audio, camera, video, location)

- Request runtime permission **at the moment of use**, with the platform rationale, never all upfront.
- Denial → a degraded state and a path to retry/explain, never a crash or silent failure.
- These permissions are not required for core account functionality unless the PRD explicitly requires it.
- Raw media and precise location are never logged and never uploaded without consent + legal basis (see `docs/LEGAL.md`).

## List, form, state, accessibility rules

Delegated to `docs/STANDARDS.md` §5–§8 and the corresponding skills: `list-and-pagination`, `screen-states`, `form-and-mutation`, `navigation-review`, `mobile-journey-test`.

## What to verify before claiming mobile support

- `mobile-journey-test` representative journey passes (login → paginated list → detail → back preserving context → logout).
- Network errors, empty states, permission denials covered.
- Back/gesture/header behavior verified on the target platform.
- Accessibility claims only after real testing, not static inspection.
