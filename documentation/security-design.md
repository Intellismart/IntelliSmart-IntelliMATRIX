8# Security Design — IntelliSMART AI Factory (as-built)

Date: 2025-09-28
Owner: Engineering Security
Scope: Security posture for the demo build — authentication, authorization, tenancy isolation, transport, input handling, real-time, and known gaps. This document complements needtofix.md.

1. Security Goals
- Prevent unauthorized access to protected areas (/portal, /admin)
- Enforce tenant isolation across all data operations
- Provide basic integrity for sessions without external dependencies
- Surface security-related features (alerts, scan, cameras) for demo realism

2. Authentication (AuthN)
- Mechanism: Signed cookie sessions (lib/auth.ts)
  - Cookie name: session; httpOnly; sameSite=lax; path=/
  - Session payload: { userId, role, tenantId?, iat }
  - Integrity: HMAC-SHA256 over base64url(payload) using SESSION_SECRET
  - Default secret: dev-demo-secret (override with env SESSION_SECRET in production)
- Login flow: POST /api/login validates email+password against data/db.json and sets cookie
- Logout: POST /api/logout clears cookie
- Hardening recommendations:
  - Set cookie secure flag in production, consider SameSite=strict
  - Rotate SESSION_SECRET; support token expiry (exp) and refresh
  - Replace demo auth with NextAuth/SSO and hashed passwords

3. Authorization (AuthZ) & RBAC
- Roles: admin, reseller, business, consumer
- Route protection:
  - middleware.ts guards /portal and /admin (redirects if no session cookie)
- API-level checks:
  - requireAuth() validates signature and optionally ensures minimum role
  - Resource scoping to active tenant in each handler (e.g., agents, alerts, cameras)
- Tenant selection:
  - Business/Consumer bound to their tenantId
  - Reseller may switch among managedTenantIds via /api/tenant/select
  - Admin may select any tenant
- Improvement:
  - Add per-resource permission checks (create/update/delete policies)
  - Add audit logging for sensitive actions

4. Tenancy Isolation
- Data model includes tenantId on Agents, SecurityAlerts, Cameras (and Users/Tenants)
- Every list/update action filters by the active tenant (auth.session.tenantId or user.tenantId)
- SSE events include tenantId and are filtered server-side before enqueue
- Improvement: enforce tenantId at schema boundary and in writeDb helpers (guardrails)

5. Input Validation & Data Integrity
- JSON APIs parse and validate required fields; minimal type checks in handlers
- Known gaps:
  - No centralized validation library (e.g., zod)
  - Some POST endpoints accept free-form strings; potential for oversize payloads
  - No rate limiting; potential brute force on /api/login
- Recommendations:
  - Introduce schema validation with size limits per endpoint
  - Implement rate limiting (IP/user/tenant) and account lockouts
  - Sanitize/escape user-supplied data surfaced in UI (currently simple text)

6. CSRF, CORS, and Browser Controls
- CSRF: Not implemented; mitigation partially via SameSite=lax cookie and middleware gate on protected pages
- CORS: Not configured; Next defaults to same-origin
- Recommendations:
  - Add CSRF tokens for state-changing POST endpoints
  - Enforce Origin/Referer checks on POST requests
  - Consider double-submit cookie pattern if staying cookie-based

7. Transport Security
- Development: HTTP localhost
- Production guidance:
  - Terminate TLS (HTTPS) at edge or app server
  - Set Strict-Transport-Security (HSTS) headers
  - Mark session cookie secure

8. Secrets & Configuration
- SESSION_SECRET environment variable used for HMAC signing
- Guidance:
  - Store secrets via environment or secret manager (never in VCS)
  - Rotate secrets; ensure distinct secrets per environment

9. Real-time (SSE) Security
- Endpoint: GET /api/events
- Isolation: Listeners receive only events for active tenant (server-side filtering)
- Keep-alive: Sends ": keep-alive" comments every 25s
- Known gaps:
  - Teardown currently removes some listeners; ensure all event types and heartbeat interval cleared on disconnect
  - No per-connection rate limiting or backpressure checks
- Recommendations:
  - Implement cancel() to remove all listeners and clear intervals; drop idle connections
  - Add connection count limits per tenant/user

10. Logging, Monitoring, and Audit
- Minimal console-level logging; no audit trail of actions
- Recommendations:
  - Add structured logs with request IDs and user/tenant context
  - Persist audit events (login, tenant-switch, create/update operations)
  - Add security alert acknowledgement/resolution audit entries

11. Security Features (Product)
- Security Alerts API
  - /api/security/alerts (GET/POST) and /api/security/alerts/:id/status (POST)
  - Emission of security_alert events via SSE
- Security Scan API
  - /api/security/scan (POST) synthesizes alerts by scope (network/camera/endpoint/cloud)
- Camera Security
  - /api/cameras (GET/POST) and /api/cameras/:id/toggle (POST)
  - Emits camera_update on status changes

12. Threat Model (High Level)
- Assets: session tokens, tenant-scoped data, admin/reseller capabilities
- Adversaries: external attacker (unauthenticated), authenticated low-privilege user, reseller/admin abusing privileges
- Key risks & mitigations:
  - Token forgery → HMAC signatures with secret; use secure cookies & CSRF tokens (todo)
  - Cross-tenant data access → server-side tenant filtering and param checks
  - Brute force on login → add rate limiting and account lockouts
  - SSE misuse/leak → tenant filtering; add teardown and limits
  - Data exfiltration via API → RBAC + audit logs and per-endpoint quotas

13. Hardening Checklist (Pre-Launch)
- Set SESSION_SECRET and enable secure cookies
- Add CSRF tokens and Origin checks for POST endpoints
- Implement rate limiting on /api/login and data-changing endpoints
- Harden SSE cancel/cleanup and listener management
- Add audit logs for admin, reseller, and security actions
- Review needtofix.md and close Critical/High items before public trials
