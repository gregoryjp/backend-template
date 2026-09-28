# Engineering & UX standard (obligatorio)

This file is the single canonical source for the mandatory rules. Procedures live in `skills/`, acceptance criteria live in `docs/specs/<feature>.md`, and executable checks live in `scripts/` (wired into `npm run check`). When a PRD adds a user interface, the **UX/Mobile** role and the `navigation-review`, `list-and-pagination`, `screen-states`, `form-and-mutation`, and `mobile-journey-test` skills become applicable.

## 1. Package manager

- npm only. `package-lock.json` committed.
- `npm ci` in CI and for reproducible verification.
- `npm run <script>` for every documented command — commands in docs must exist in `package.json`.
- No `pnpm-lock.yaml`, no `yarn.lock`.
- Node ≥ 22 and npm version documented (`.nvmrc`, `package.json.engines`).

## 2. Architecture and scope

- Backend: Node.js + Express + strict TypeScript + PostgreSQL, modular (routes/controllers/services/repositories/schemas/types/tests).
- An **optional mobile profile** is prepared (`docs/MOBILE_PROFILE.md`). It is a *profile*, not an implemented app — never claim a mobile experience exists when only the backend does.
- Before building any mobile app: identify the project stack and settle on **one** compatible navigation solution; document the decision; do not mix navigation systems without a reason.

## 3. Feature planning (gate before implementation)

No module is ready to implement until these are defined (mark each as N/A with a one-line reason when it does not apply — do not build features to fill a list):

- PRD goal and requirements.
- Users and permissions.
- Screens and entry points.
- Primary journey and alternatives.
- API contract.
- Data, validation, business rules.
- Lists, filters, search, pagination.
- Loading, empty, error, success states.
- Behavior on lost connection/session.
- Acceptance criteria and pertinent tests.

## 4. Mobile navigation (when UI exists)

Before building screens, produce a navigation map covering: startup and session restore; public/auth/private flows; main navigation, detail screens, modals; each screen's entries and exits; back/close behavior; deep links when present.

Obligatory rules:

- Typed routes and parameters.
- Pass identifiers; avoid whole objects and sensitive data in parameters.
- Explicit policy for Android back, back gestures, and header buttons.
- Closing a modal and going back are deliberate, distinct behaviors.
- After logout, history must not let the user return to private content.
- On session restore, never briefly show the wrong screen.
- After login, restore a pending destination only if valid and authorized.
- Handle deleted, missing, or forbidden resources.
- Avoid duplicate screens from repeated taps.
- Define what happens to unsaved forms on exit.
- Preserve list filters/position when returning from detail when relevant.
- Handle direct entry to a detail without assuming a previous screen.
- UI guards never replace backend authorization.

Test full journeys including back, logout, expired session, and direct entry when applicable.

## 5. Lists, search, pagination

Backend:

- Pagination applied in the PostgreSQL query (never in-memory).
- Default and maximum page size validated.
- Deterministic ordering with a tie-breaker.
- Allowed filters/orderings via an explicit allowlist.
- Authorization and isolation applied **before** paginating and counting.
- Indexes consistent with the queries.
- Response contract documented.
- Choose cursor for feeds/large changing lists when it fits; page/offset for numbered pages when its cost is acceptable.
- Document concurrent-change limitations; never promise an immutable view without a strategy.
- Skip a costly total count when the UI does not need it.

Interface:

- Initial load distinct from "loading more".
- General empty state distinct from "no results for these filters".
- Recoverable error without discarding loaded results.
- End-of-results indicator.
- Avoid duplicate concurrent requests.
- Reset pagination correctly on filter/search change.
- Ignore or cancel stale responses.
- Avoid duplicates when merging pages.
- Define refresh/reconciliation after create/edit/delete.
- Virtualize long lists when the platform requires it; stable identifiers as keys.
- Debounce remote search when relevant.
- Small bounded lists may skip pagination, with the bound documented.

## 6. Forms and mutations

- Client validation helps the user; server validation is the authority.
- Per-field and general errors, comprehensible.
- Preserve entered data on recoverable failures.
- Submission state and double-tap protection.
- Keyboard type, autofill, safe password handling.
- Keyboard must not cover fields or the primary action.
- Unsaved-change handling.
- Confirm destructive operations by impact.
- Clear post-action feedback.
- For operations where duplicates have consequences, protect in the backend too (constraints, transactions, idempotency).
- Never auto-retry writes that could duplicate the operation.

## 7. UI states and accessibility

Each screen defines the applicable states: initial loading, content, empty with a useful next action, error with recovery, offline, background refresh, no permission, expired session. Shared components and visual criteria for these states.

Include: safe areas and screen sizes; enlarged text without losing essential actions; accessible labels and focus order; contrast and states not relying on color alone; touch targets per platform guidelines; respect reduced-motion preferences; helpful messages without leaking internals.

**Accessibility is never "verified" from a static inspection alone** — record any claim as pending until tested with assistive tech / platform tools.

## 8. Remote data, session, connectivity

- Cache keys include filters and identity/context where relevant.
- Invalidate after mutations.
- Clear private data on logout / account switch.
- Expiry handling without infinite refresh loops; coordinate concurrent renewals.
- Timeouts and limited retries only for safe operations.
- Network errors distinct from validation/permission errors.
- A network failure is not an empty list.
- No full offline mode promised without sync + conflict resolution; at baseline, report disconnection and allow safe recovery.
- Credential storage per platform; never log tokens or sensitive data.

## 9. Cross-cutting contracts

- Stable HTTP error codes (see `src/infrastructure/errors.ts`).
- Dates, time zones, and presentation formats agreed.
- Money with exact representation and explicit currency when applicable.
- Uniqueness and concurrency constraints.
- Input limits and upload limits when that feature exists.
- Deletion/deactivation and effects on references.
- API evolution and migrations.
- When a decision depends on the business, resolve it from the PRD — never silently adopt project-specific rules from another product.

## 10. Legal and device permissions

See `docs/LEGAL.md`. Registration records versioned consents (terms/privacy/marketing) enforced server-side from configuration. Device permissions (audio/camera/video/location) are client runtime permissions, requested only when used, with explicit rationale and denial handling — never required for core account functionality unless the PRD demands it, and never stored/uploaded without consent and a legal basis.

## 11. Security

SQL injection and injection attacks are covered by: Prisma parameterized queries (enforced by `scripts/check-raw-sql.mjs`), input validation (Zod), strict authz in the backend, no secrets in logs (pino redaction), and the `security-review` skill. See `skills/security-review.md`.

## 12. Definition of a finished module

A module is "finished for its agreed scope" only when:

- Requirements have implementation and related tests.
- Contracts and permissions are checked.
- Pertinent migrations are verified.
- Lists meet the pagination policy.
- Forms and applicable states are implemented.
- Navigation entry/exit/back is verified when there is a UI.
- Affected integrations pass their checks.
- Documentation and tracking are updated.
- Required review has evidence.
- No hidden blockers.

Report these dimensions separately: backend verified, interface verified, integration verified, independent review. If no emulator/device/provider/reviewer is available, record that verification as **pending** — do not invent results.

## 13. Tracking and audit

- `npm run status` — progress summary from registered evidence.
- `npm run status:audit` — validates the register: requirements without tasks, closed tasks without evidence, stale evidence (non-zero exit on findings).
- A status query reads registered evidence; an audit inspects the requested scope.

## 14. Template self-test

Before declaring the template done, create a temp project from it and verify: reproducible `npm ci`; startup following only the README; migrations on empty PostgreSQL; tests and build; name/config initialization; planning flow from the example PRD. If a mobile profile is included, verify a representative journey (login → paginated list → detail → back preserving context → logout) plus network errors, empty states, and permissions.

Quality is measured by verified behaviors and reuse, not by agent/file/test counts.
