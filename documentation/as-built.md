# As‑Built Documentation — IntelliSMART AI Factory

Date: 2025-09-28
Owner: Engineering
Scope: This document describes the current, working production demo contained in this repository. It is the authoritative “as-built” for frontend, backend, data model, tenancy, real-time, and operational behavior.

1. System Overview
- Purpose: A dynamic e‑commerce front for AI, robotics, drones, and smart home technology, with a multi-tenant customer portal and admin console, suitable for user testing and demos.
- Stack:
  - Next.js 15 (App Router), React 19, TypeScript 5
  - Tailwind CSS (utility classes) + minimal bespoke components (Button)
  - File-based persistence: data/db.json with atomic writes
  - AuthN: signed cookie sessions (HMAC) via lib/auth.ts
  - RBAC/Tenancy: role-aware APIs with tenant scoping
  - Real-time: Server-Sent Events (SSE) via /api/events and lib/events.ts
- Deployment target: Next.js dev/prod server; no external DB or auth provider required for the demo.

2. Frontend (Pages and Components)
- Global layout (app/layout.tsx):
  - Dark theme by default, fonts via Geist/Geist Mono
  - Shared Navbar with UserMenu. Main content container uses Tailwind spacing utilities.
- Navbar (components/Navbar.tsx):
  - Routes: Home (/), Shop (/store), News (/news), Reviews (/reviews), Tips (/tips), Support (/support), Portal (/portal), Resellers (/resellers)
  - UserMenu shows role/tenant and offers Sign in/Sign out.
- Key pages:
  - Home (app/page.tsx): Gradient hero, curated imagery, Featured Categories (AI Agents, Robotics, Drones, Smart Home, High‑Tech Tools, Toys), and 3 dynamic widgets (News, Reviews, Tips).
  - Store (app/store/page.tsx): Product grid with images, subscription CTAs. Category anchors.
  - News/Reviews/Tips (app/news|reviews|tips/page.tsx): Aggregated content via server utilities in lib/feeds.ts with daily revalidation.
  - Portal (app/portal/page.tsx): Client page with audience modes (business/consumer/reseller), KPIs, agent controls, training data stub, security/camera sections, subscription info, and SSE live updates.
  - Admin (app/admin/page.tsx): Tenants and Users management, plus stubbed admin tiles.
  - Auxiliary/Placeholders: Tools, Marketplace alias, Custom Login, Tenant Login, Contact, Forum to avoid 404 and for future expansion.
- UI components:
  - Button (components/ui/button.tsx): variant/size via class-variance-authority, uses cn() from lib/utils.
  - Widgets: NewsWidget, ReviewsWidget, TipsWidget.

3. Backend (APIs)
- Auth/session
  - POST /api/login — validates demo credentials in db.json; sets signed session cookie.
  - POST /api/logout — clears session cookie.
  - GET /api/me — returns current user and active tenant.
- Tenancy & Users
  - GET/POST /api/tenants — list/create tenants (admin/reseller; others see only their tenant).
  - POST /api/tenant/select — set active tenant (admin/reseller or self-tenant for others).
  - GET/POST /api/users — list/invite users (admin/reseller; scoped for others).
- Agents
  - GET/POST /api/agents — list/create per-tenant agents.
  - POST /api/agents/:id/toggle — start/stop; emits SSE agent_update.
- Security
  - GET/POST /api/security/alerts — list/add alerts per tenant; emits SSE security_alert on add.
  - POST /api/security/alerts/:id/status — update status; emits SSE security_alert.
  - POST /api/security/scan — synthesize scan results (network/camera/etc.) and persist alerts; emits SSE.
- Cameras
  - GET/POST /api/cameras — list/create cameras per tenant.
  - POST /api/cameras/:id/toggle — toggle online/recording, update lastSeen; emits SSE camera_update.
- Real-time
  - GET /api/events — SSE stream that forwards agent_update, security_alert, camera_update for the active tenant, with periodic keep-alives.

4. Middleware
- middleware.ts protects /portal and /admin, redirecting unauthenticated users to /login?next=...

5. Authentication and Sessions (lib/auth.ts)
- Session cookie name: session
- Format: base64url(JSON payload) + HMAC-SHA256 signature using SESSION_SECRET (default dev-demo-secret)
- Payload: { userId, role, tenantId?, iat }
- Cookie flags: httpOnly, sameSite=lax, path=/; secure flag recommended in production.

6. Tenancy and RBAC (lib/types.ts and route guards)
- Roles: admin, reseller, business, consumer
- Tenant selection:
  - Business/Consumer: implicit, bound to their tenantId
  - Reseller: can select from managedTenantIds via /api/tenant/select
  - Admin: can select any tenant
- API guards: requireAuth() checks presence of session and enforces minRole where specified; resource queries always filter by active tenant.

7. Data Model (lib/types.ts; data/db.json)
- DbSchema collections: tenants[], users[], agents[], securityAlerts[], cameras[]
- Key entities:
  - Tenant { id, name, createdAt, ownerUserId? }
  - User { id, email, name, role, tenantId?, managedTenantIds?, password? (demo only) }
  - Agent { id, tenantId, name, status }
  - SecurityAlert { id, tenantId, severity, source, title, description?, time, status }
  - Camera { id, tenantId, name, location?, online, recording, lastSeen }
- Persistence: JSON file with atomic writes via tmp+rename. Seed data created on first run.

8. Real-time Events (lib/events.ts, /api/events)
- Event types: agent_update, security_alert, camera_update
- Transport: SSE with tenant filtering server-side
- Heartbeats: ": keep-alive" comments every 25s
- Consumer behavior: Portal subscribes and updates state or triggers list refresh as needed.

9. Dynamic Content (lib/feeds.ts)
- News: Google News RSS for AI, Robotics, Autonomous, Smart Home (daily revalidate)
- Reviews: Engadget Reviews, TechRadar Smart Home Reviews (daily revalidate)
- Tips: Local curated list, rotates deterministically per day

10. Operations
- Local development:
  - npm install; npm run dev; open http://localhost:3000/login and use quick logins
- Data reset:
  - Delete data/db.json to reseed on next server start
- Adding tenants/users:
  - Use Admin page or call APIs directly; tenant selection available in Portal for reseller/admin

11. Known Limitations (demo constraints)
- Credentials stored in plaintext in data/db.json
- No CSRF tokens or origin checks on POST endpoints (middleware limits some exposure)
- SSE teardown in /api/events removes some listeners; ensure all event listeners and timers are cleaned on disconnect in future hardening
- No rate limiting or audit logging
- File store has no formal migrations (arrays are initialized when missing at write points)

12. Backlog and Next Steps
- Replace demo auth with NextAuth/SSO; hash passwords
- Add CSRF protection and secure cookies (SameSite=strict/secure)
- Move persistence to Postgres + Prisma; add migrations and relational integrity
- Implement granular permissions and audit logs
- Add device/agent runtimes and streaming UIs; production-grade observability
- Harden SSE cancel/cleanup and backpressure handling

13. Handover Checklist
- SESSION_SECRET set in production environment
- HTTPS termination enabled; secure cookies on
- Validate demo accounts and quick-login flow
- Confirm data/db.json permissions and backup behavior in deployment
- Review needtofix.md before launch; address Critical/High items