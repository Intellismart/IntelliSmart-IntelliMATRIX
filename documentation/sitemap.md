8# Site Map — IntelliSMART AI Factory (as-built)

This site map lists all user-facing routes and API endpoints in the repository, their purposes, and protection status.

1) Web App Pages (App Router)
- / — Home: Hero, featured categories, News/Reviews/Tips widgets
- /store — Shop: Product grid and CTAs
- /delivery — Autonomous Delivery overview and links
- /news — Industry News (server-side RSS aggregation)
- /reviews — Tech Reviews (server-side RSS aggregation)
- /tips — Hints & Tips (daily rotation)
- /support — Support overview
- /portal — Customer Portal (Protected)
- /admin — Admin Console (Protected)
- /resellers — Reseller Program
- /tools — Online Tools (placeholders)
- /marketplace — Marketplace alias (links to /store)
- /custom-login — Custom/Enterprise login placeholder
- /tenant-login — Tenant login placeholder
- /contact — Contact us placeholder
- /forum — Community forum placeholder
- /login — Demo login with quick-login buttons

2) Protection and Middleware
- Protected paths by middleware.ts: /portal, /admin (including nested paths)
- Behavior: If session cookie missing → redirect to /login?next=<path>

3) API Endpoints (all dynamic)
- Auth & Session
  - POST /api/login — sign in; body: { email, password, tenantId? }
  - POST /api/logout — sign out
  - GET  /api/me — current user + tenant
- Tenants & Users
  - GET  /api/tenants — list tenants (role-based)
  - POST /api/tenants — create tenant (admin/reseller)
  - POST /api/tenant/select — set active tenant (admin/reseller or self-tenant)
  - GET  /api/users — list users (role-scoped)
  - POST /api/users — invite/create user (role-scoped)
- Agents
  - GET  /api/agents — list agents in active tenant
  - POST /api/agents — create agent { name, status? }
  - POST /api/agents/:id/toggle — start/stop agent
- Security
  - GET  /api/security/alerts — list security alerts
  - POST /api/security/alerts — create security alert { title, severity?, source?, description? }
  - POST /api/security/alerts/:id/status — update status { status }
  - POST /api/security/scan — synthesize alerts for scope { scope?: network|camera|endpoint|cloud }
- Cameras
  - GET  /api/cameras — list cameras
  - POST /api/cameras — create camera { name?, location? }
  - POST /api/cameras/:id/toggle — toggle { field: "online"|"recording" }
- Transports
  - GET  /api/transports — list transports
  - POST /api/transports — create transport { vehicleId?, kind?, location? }
  - POST /api/transports/:id/status — update status { status }
- Real-time
  - GET  /api/events — Server-Sent Events (agent_update, security_alert, camera_update, transport_update; keep-alives)

4) Data Locations
- JSON store: data/db.json (tenants, users, agents, securityAlerts, cameras)
- Public assets: public/ (not currently used for custom images — Unsplash URLs are embedded)

5) Navigation & Relationships
- Navbar links: Home, Shop, News, Reviews, Tips, Support, Portal, Resellers
- Home widgets link to News/Reviews/Tips pages; Store CTAs link to Portal/Store
- Portal references Agents API, Security APIs, Cameras API, Tenants API (for reseller/admin)
- Admin operates on Tenants and Users APIs

Note: All API endpoints expect an authenticated session, except /api/login. Role and tenant scoping applies to list/create/update behaviors as implemented in route handlers.