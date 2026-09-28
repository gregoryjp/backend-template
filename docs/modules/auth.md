# Module: auth

## Contract

Mounted at `/api/auth`.

| Route | Purpose |
| --- | --- |
| `POST /register` | create user, record legal consents, send verification email |
| `POST /verify-email` | redeem one-time verification token |
| `POST /login` | start a session (sets refresh cookie + returns access token) |
| `POST /logout` | revoke the current session |
| `POST /logout-all` | revoke all of the user's sessions |
| `POST /refresh` | rotate refresh token, return new access + refresh |
| `POST /forgot-password` | send one-time reset token |
| `POST /reset-password` | redeem token, set new password, revoke sessions |
| `POST /change-password` | authenticated password change (revokes other sessions) |

## Entry points (`index.ts`)

- `authRouter` — mounted at `/api/auth`.
- `requireAuth` — attaches `req.user` (session-authenticated) or returns 401.
- `requireRole("ADMIN")` — 403 unless the role matches.
- `authService` — for programmatic use by other modules via the public interface.

## Policies (details in `docs/specs/auth.md`)

- Account enumeration protection: identical responses for unknown email/account in login, forgot-password, and resend paths.
- Disabled accounts: `403 ACCOUNT_DISABLED`; login/refresh/verify/reset all blocked.
- Legal consent: mandatory consents enforced from config (`LEGAL_*`); missing → `400 LEGAL_CONSENT_REQUIRED`. Consents are stored versioned in `LegalConsent`.
- Refresh reuse/concurrency: one-time token; reuse revokes the session family.
- Tokens: one-time, hashed at rest, expiring; credentials ride HttpOnly `SameSite=Strict` cookies, access token in memory (Bearer).
