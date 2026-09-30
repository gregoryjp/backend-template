# SaaS capabilities from the supplied video

The 83-second Django SaaS video names authentication, 2FA, chat/AI chat, teams, roles, invitations, API keys, GDPR, checkout/webhooks/limits, deployment, tests and agent skills. It does not provide full source code or acceptance criteria. This adapts those capabilities to the existing Node.js, Express, strict TypeScript, Prisma, PostgreSQL and npm template.

| Capability | Existing state | Next work |
| --- | --- | --- |
| Email auth, verification, password reset | Implemented | Preserve and regression test |
| 2FA | Missing | TOTP enrollment/challenge, recovery, replay protection |
| Teams, roles, invitations | Missing; USER/ADMIN are global roles | Organization tenancy and membership permissions |
| Team API keys | Missing | Scoped, hashed, revocable keys |
| GDPR/data rights | Partial; versioned signup consent | Export, erasure and retention workflow |
| Checkout, webhooks, plan limits | Missing | Optional billing provider adapter and entitlement ledger |
| AI chat | Missing | Optional provider with consent, retention and budget |
| Deployment | Docker/CI/health exist | Target-specific TLS, secrets, backups, monitoring and restore |
| Tests | Existing baseline suite | Behavior-based tests per new module |
| Claude skills | Tool-agnostic skill documents exist | Optional packaging for selected coding agent |

The video's numeric test and skill counts are marketing claims, not verified targets. No missing capability is implemented by this specification.

## Rules

- Each capability must be selected by the new project's PRD; solo products need no organizations, paid plans or AI.
- Global platform ADMIN does not imply organization access. OWNER/ADMIN/MEMBER are separate memberships.
- Scope every tenant-owned database query and mutation to an authorized organization.
- Store token and API key hashes, never plaintext. Use npm with a committed package-lock.
- Document provider costs, secret handling, consent, retention and failure behavior before an integration.

## Delivery order and proposed contracts

### S1 Organizations and invitations

POST/GET /api/organizations; GET/PATCH /api/organizations/:organizationId; GET /api/organizations/:organizationId/members?cursor=&limit=; PATCH/DELETE /api/organizations/:organizationId/members/:userId; POST/GET /api/organizations/:organizationId/invitations; DELETE /api/organizations/:organizationId/invitations/:invitationId; POST /api/invitations/:token/accept.

Hash invitation tokens, expire and consume atomically, require verified email, prevent removal of the last owner. Test cross-tenant denial, concurrent acceptance and pagination.

### S2 Two-factor authentication

POST /api/auth/2fa/setup, /confirm, /challenge, /recovery; DELETE /api/auth/2fa. Encrypt TOTP secret with a separately managed key; hash single-use recovery codes. Setup remains inactive until confirmed. Issue a short-lived purpose-bound challenge on password success and no full session until second-factor success. Limit attempts, prevent replay and audit changes. Reauthentication is required to disable. Lost-device policy and clock tolerance need explicit decisions.

### S3 Organization API keys

POST/GET /api/organizations/:organizationId/api-keys; DELETE /api/organizations/:organizationId/api-keys/:keyId. Return secret once; persist hash, prefix, scopes, expiry and revocation. Enforce tenant scope and permissions at every resource.

### S4 Data rights

POST /api/me/data-export; GET /api/me/data-export/:jobId; POST/GET /api/me/erasure-request. Define delivery expiry, retention exceptions and organization ownership transfer. Disabling an account is not erasure. Obtain product-specific legal review.

### S5 Optional billing

POST /api/billing/checkout, /portal; GET /api/billing/subscription, /usage; POST /api/webhooks/billing. Verify provider signature over raw request body, persist unique events, process idempotently and reconcile out-of-order events. Server-side entitlements govern access. Define plans, trials, grace, overage and refund policy in PRD; use integer minor units and currency.

### S6 Optional AI chat

POST /api/ai/conversations; GET /api/ai/conversations?cursor=&limit=; GET/POST /api/ai/conversations/:id/messages. Tenant and user authorization, size and cost budgets, data-sharing policy, retention, provider timeout and cancellation. No provider credentials in clients.

### S7 Operations

Choose hosting target; verify TLS, CORS, secret injection, migrations, backup and restore, monitoring and rollback. CI success alone does not certify production.

For each sprint: detailed spec, schema migration, OpenAPI, Bruno, meaningful tests, security review, and updates to STATE/BACKLOG/PROJECT_MAP. These endpoint names are proposed contracts, not live routes.
