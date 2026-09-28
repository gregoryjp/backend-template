# Spec: Auth

Requirements and acceptance for authentication and sessions.

## Requirements

- R1 Registration produces an unverified account and sends a verification email.
- R2 Verification redeems a one-time, expiring token; login is allowed only after verification.
- R3 Login/L​ogout/L​ogout-all manage revocable server-side sessions.
- R4 Refresh rotates the token; reuse of a refresh token revokes the session family.
- R5 Password recovery uses a one-time, expiring, hashed-at-rest token.
- R6 Password change requires the current password and revokes other sessions.
- R7 Passwords hashed with Argon2id; hashes never returned by any route.
- R8 Disabled accounts are rejected everywhere with `ACCOUNT_DISABLED`.
- R9 Enumeration protection: identical responses regardless of whether an account exists.
- R10 Verification/recovery tokens are single-use and stored hashed.
- R11 Registration records versioned legal consents (terms/privacy required by default; marketing optional), enforced server-side from configuration — see `docs/LEGAL.md`.

## Acceptance (covered by `src/modules/auth/__tests__/`)

- Register → verify → login round-trip returns an access token and sets the refresh cookie.
- Wrong password and unknown email return the same error shape (no enumeration).
- Reusing a refresh token invalidates the session family (subsequent refresh → 401).
- Logout revokes the current session; logout-all revokes all sessions.
- Reset token is one-time and expires; reuse → 410/400.
- Change password invalidates other sessions but not the current one.
- Disabled account → login/refresh/verify/reset all fail with `ACCOUNT_DISABLED`.
- Registering a duplicate email → `409 EMAIL_TAKEN`.
- Registering without a mandatory consent → `400 LEGAL_CONSENT_REQUIRED`, and no account is created.
- Accepted consents are stored with the configured version (never a client-supplied version) and timestamp.

## Credential transport

- Access token: `Authorization: Bearer`, short-lived, kept in memory by clients.
- Refresh token: `HttpOnly; SameSite=Strict; Secure` (Secure in production), path-scoped to `/api/auth/refresh`.
- CSRF: state-changing endpoints require the Bearer access token (not the cookie), so a cross-site form cannot ride the refresh cookie. No web/mobile client is bundled; each client must be validated against these flows before claiming support.
