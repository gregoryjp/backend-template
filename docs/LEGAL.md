# Legal & compliance

This template provides the **mechanisms** for legal compliance; the actual legal text and thresholds come from the PRD and local counsel. It is not legal advice.

## Consent at registration

- Registration records **versioned** consents for Terms, Privacy, and optional Marketing in the `LegalConsent` table.
- Requirement is config-driven: `LEGAL_TERMS_REQUIRED`, `LEGAL_PRIVACY_REQUIRED` (default true) — a PRD decides which agreements are mandatory.
- Versions are `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_VERSION`, `LEGAL_MARKETING_VERSION`. The **server** records the configured current version; it never trusts a version string sent by the client.
- Missing mandatory consent → `400 LEGAL_CONSENT_REQUIRED`; no account is created.
- Consent rows carry `acceptedAt`, `ip`, and `userAgent` — auditable proof of agreement.

## Age and vulnerable users

- `LEGAL_MINIMUM_AGE` is **not** implemented as enforcement by default; real age/COPPA/GDPR-child verification is a PRD + third-party-verification decision. Do not silently adopt another product's thresholds.

## Data minimization and retention

- Never log secrets or tokens (pino redaction); audit logs record actions, not secrets.
- Password hashes only (Argon2id); hashes never leave the API.
- Erasure / "right to be forgotten": deactivation is implemented (`/api/admin/users/:id/status`); full erasure (and any retention schedule) is a PRD-driven extension with an ADR.

## Device permissions and sensitive data

- Audio/camera/video/location are client runtime permissions (see `docs/MOBILE_PROFILE.md`), requested only at use, with denial handling.
- The backend must not require or store raw media/precise location without an explicit, documented legal basis and consent.

## Lawsuit / liability mitigations

- **Proof of agreement:** versioned, timestamped consent rows per user.
- **Audit trail:** `AuditLog` for sensitive admin actions; consent records for signup.
- **No self-service privilege escalation**; authorization always enforced server-side.
- **Enumeration protection** and rate limiting reduce abuse exposure.
- **No default credentials**; admin bootstrap is explicit and audited.
- **Clear terms**: actual legal text (terms/privacy) is provided by the PRD; the template never ships placeholder legal text as if real.

## Config reference

`LEGAL_TERMS_REQUIRED`, `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_REQUIRED`, `LEGAL_PRIVACY_VERSION`, `LEGAL_MARKETING_VERSION` (see `.env.example`).
