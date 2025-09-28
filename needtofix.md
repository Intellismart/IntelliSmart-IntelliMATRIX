# Launch Readiness Audit — IntelliSMART AI Factory

Date: 2025-09-28 18:47 local
Owner: Engineering
Purpose: Systematically list defects, gaps, fake/placeholder content, risky defaults, and design inconsistencies across the entire repo. Each item includes a succinct, copy‑pasteable prompt/instruction to fix it, with acceptance criteria. Address items roughly in priority order.

NOTE: This project is a production demo scaffold. Some items are intentionally minimal. The goal here is to move from demo to launch‑ready.


## Priority 0 — Broken features and data model issues

1) Cameras API missing (portal relies on it)
- Where observed: app/portal/page.tsx calls:
  - GET /api/cameras
  - POST /api/cameras
  - POST /api/cameras/:id/toggle
- Status: No corresponding API routes exist (search confirms none under app/api/cameras). Camera UI therefore cannot function.
- Fix prompt:
  Implement modular camera endpoints with tenant scoping and SSE emissions.
  - Create routes:
    - GET app/api/cameras/route.ts — list cameras for active tenant
    - POST app/api/cameras/route.ts — create camera (name, optional location; default online=false, recording=false)
    - POST app/api/cameras/[id]/toggle/route.ts — toggle online|recording; emit bus "camera_update"
  - Persistence: use data.db.cameras (auto‑init [] if missing)
  - Auth: requireAuth(); ensure tenantId from session/user; 404 when camera not found
  - SSE: bus.emit("camera_update", { tenantId, cameraId, online?, recording? }) after writes
  - Acceptance:
    - Portal Camera Security section loads, can Add Camera, toggle online/recording; updates reflect instantly via SSE; multi‑tab works per tenant.

2) Security scan endpoint missing (invoked by portal)
- Where observed: app/portal/page.tsx calls POST /api/security/scan with { scope: 'network' | 'camera' }
- Status: Not implemented.
- Fix prompt:
  Implement a minimal security scan endpoint that generates alerts per tenant.
  - Create app/api/security/scan/route.ts (POST)
  - Body: { scope?: 'network'|'camera'|'endpoint'|'cloud' }
  - Behavior: synthesize 1–3 SecurityAlert entries with appropriate source/severity; write to db.securityAlerts; emit bus "security_alert"
  - Acceptance: Clicking "Run Scan" or "Scan Cameras" in Portal adds alerts that appear immediately and via SSE.

3) Database schema drift (existing db.json is missing new arrays)
- Where observed: data/db.json currently contains tenants, users, agents only. Code and types expect securityAlerts[] and cameras[].
- Risk: API code that reads or writes these arrays may encounter undefined or create sparse state; seed() contains them, but loadDb() does not migrate existing files.
- Fix prompt:
  Add safe initialization/migration for new arrays.
  - In lib/store.ts loadDb(): after parsing JSON, ensure db.securityAlerts ||= []; db.cameras ||= []
  - Add a one‑time migration helper that writes back the augmented schema.
  - Document in README how to clear or migrate db.json
  - Acceptance: Starting server with existing db.json does not crash; GET /api/security/alerts returns [] not 500; future arrays persist.

4) SSE resource cleanup + listeners leak in /api/events
- Where observed: app/api/events/route.ts
  - Only removes the agent_update listener; security_alert and camera_update listeners aren’t detached.
  - ReadableStream start() returns a function for cleanup, but Web Streams ignore return from start(); cleanup should be implemented in cancel() or with a controller on close.
  - Heartbeat interval may continue after client disconnect.
- Fix prompt:
  Refactor the SSE stream to support proper teardown.
  - Implement both start() and cancel(reason) in the underlying source; in cancel(), clearInterval and remove all three listeners
  - Also remove security_alert and camera_update in teardown
  - Optional: send event: "ping" comments periodically and handle backpressure
  - Acceptance: Closing the EventSource or navigating away cleans timers/listeners (validate with console logs or memory profile in dev).


## Priority 1 — User‑visible bugs and UX inconsistencies

5) Store anchors point to non‑existent sections
- Where observed: app/store/page.tsx uses top anchors #robotics, #drones, #smart-home, but the page only defines section id="ai-agents".
- Impact: Navbar anchor list misleads; clicking anchors (except AI Agents) does nothing.
- Fix prompt:
  Either add placeholder sections for Robotics, Drones, Smart Home (matching anchors), or remove the anchor nav until categories exist.
  - Preferred: Add empty sections with informative copy and a CTA back to Shop categories on Home
  - Acceptance: Clicking each anchor scrolls to the relevant section, or the anchor bar is removed.

6) Portal Account Details placeholder shows curly braces (string literal bug)
- Where observed: app/portal/page.tsx line ~326
  - placeholder="{audience === 'consumer' ? 'Full Name' : 'Company Name'}"
- Impact: Displays braces literally; looks broken.
- Fix prompt:
  Change to JSX expression: placeholder={audience === 'consumer' ? 'Full Name' : 'Company Name'}
  - Acceptance: Placeholder displays “Full Name” for consumer and “Company Name” otherwise.

7) Portal camera toggles may not visibly update
- Where observed: app/portal/page.tsx toggleCamera() posts but does not refresh state; relies on SSE camera_update which currently isn’t emitted (endpoints missing).
- Fix prompt:
  After implementing cameras API with SSE, also optimistic‑update or call loadCameras() after a successful toggle.
  - Acceptance: Toggle changes reflect immediately even if SSE is momentarily delayed.

8) Portal header shows Admin button to all users
- Where observed: app/portal/page.tsx header buttons include link to /admin regardless of role; middleware will redirect non‑authed users, but this is confusing.
- Fix prompt:
  Conditionally render Admin button only for role in {admin, reseller}.
  - Acceptance: Business/Consumer users do not see Admin; Admin/Reseller do.

9) Login page has duplicated “Or jump right in” sections
- Where observed: app/login/page.tsx contains two similarly titled cards.
- Impact: Repetition looks sloppy.
- Fix prompt:
  Merge into a single card block: include the quick login buttons and trial CTA in one section with distinct headings.
  - Acceptance: One cohesive card remains; visual density improved.

10) Navbar: missing active state highlight and keyboard focus styles
- Where observed: components/Navbar.tsx sets hover styles but not active route highlighting.
- Fix prompt:
  Use usePathname() to conditionally style the current link (aria-current="page"); ensure focus-visible styles are apparent.
  - Acceptance: Current page link is visually distinct; tabbing highlights focus.


## Priority 2 — Reliability, error handling, and resilience

11) RSS aggregation lacks error handling/fallbacks
- Where observed: lib/feeds.ts, components/NewsWidget.tsx, app/news/page.tsx, app/reviews/page.tsx
- Risk: External feeds (e.g., Google News) may be intermittently unavailable or change markup; parser is naive.
- Fix prompt:
  Add try/catch around fetchRssItems; on failure, return [] and render a friendly message; cap total items; consider a per‑feed timeout and user‑agent header.
  - Acceptance: Pages/widgets load with placeholders when feeds fail; no unhandled errors.

12) No rate limiting / brute force protection on /api/login
- Fix prompt:
  Add basic IP/user‑based rate limiting (e.g., simple in‑memory counter for demo; upgrade later). Provide uniform error messages.
  - Acceptance: Excessive login attempts are throttled; responses remain constant time.

13) Session cookie not marked secure in production
- Where observed: lib/auth.ts createSession sets httpOnly, sameSite=lax, but not secure in prod.
- Fix prompt:
  Set cookie { secure: process.env.NODE_ENV === 'production' }
  - Acceptance: In production, Set‑Cookie includes Secure.

14) CSRF protection missing for state‑changing endpoints
- Fix prompt:
  For demo keep simple: add a double‑submit CSRF token in a cookie and expected header for POST/PUT/DELETE; document exceptions for SSE GET.
  - Acceptance: POST endpoints reject requests without a valid CSRF token (behind a demo flag).

15) Input validation is minimal
- Where observed: multiple endpoints accept strings without length/format checks.
- Fix prompt:
  Add zod/yup schema validation or hand‑rolled checks; sanitize strings.
  - Acceptance: APIs reject invalid payloads with 400; UI displays errors.


## Priority 3 — Security posture and privacy

16) Plain‑text passwords in db.json
- Fix prompt:
  Transition to hashed passwords (bcrypt/argon2). Provide a dev migration: if user.password is not hashed, on next login, accept legacy once and rewrite to hashed.
  - Acceptance: No plain text passwords stored; README updated.

17) Missing audit logging and basic request logging
- Fix prompt:
  Introduce a minimal server logger (per‑request id, user id, route, status). Log security_alert and camera_update events to a file in data/logs/.
  - Acceptance: Logs present and rotated (basic size‑based).

18) No CORS policy defined (even if SSR only)
- Fix prompt:
  Ensure APIs default to same‑origin; if exposing in demo, explicitly set restrictive CORS headers or use Next config middleware.
  - Acceptance: Cross‑site requests are blocked by default.

19) Secrets management
- Fix prompt:
  Document and enforce required env vars (.env.example with SESSION_SECRET). Fail fast if missing in production.
  - Acceptance: App warns or exits when SESSION_SECRET is default in prod.


## Priority 4 — Product completeness and content integrity

20) Extensive placeholder/fake content
- Examples: Support email support@example.com, curated Unsplash images, placeholder copy in Tools/Marketplace/Custom Login/Tenant Login, Admin cards with buttons that do nothing.
- Fix prompt:
  - Replace placeholder contact with real support alias.
  - Provide legal disclaimer for demo imagery; or replace with licensed assets.
  - For placeholder pages, add banners stating “Demo / Coming Soon”; include a feedback link.
  - Acceptance: No ambiguous fake content; placeholders are clearly labeled.

21) Tools page promises functions but has no interactions
- Fix prompt:
  Wrap each tool in its own modular route (e.g., /tools/prompt-tester) with at least a minimal interactive demo.
  - Acceptance: Each tool tile links to a working demo page.

22) Marketplace alias is just a link
- Fix prompt:
  Redirect /marketplace → /store via next.config or page redirect to remove thin content.
  - Acceptance: Visiting /marketplace performs a 307/308 redirect to /store.

23) SEO/metadata gaps
- Where observed: Many pages lack rich metadata (OpenGraph/Twitter), canonical, sitemap.xml, robots.txt.
- Fix prompt:
  Add site‑wide metadata defaults in app/layout.ts; add app/robots.txt and app/sitemap.ts; ensure each page sets meaningful title/description.
  - Acceptance: Basic SEO score passes in Lighthouse.

24) Accessibility polish
- Fix prompt:
  - Ensure all interactive controls have accessible names/labels.
  - Use semantic headings (h1 per page, logical h2/h3).
  - Provide visible focus states; verify contrast in dark mode.
  - Acceptance: Automated a11y checks (axe) show no critical findings.

25) Performance and UX
- Fix prompt:
  - Consider next/image for hero/gallery images with remotePatterns configured; or keep <img> but set width/height and loading="lazy".
  - Preload key fonts; consider removing backdrop‑blur on low‑end devices.
  - Acceptance: Largest Contentful Paint and CLS improve in Lighthouse.

26) Build/runtime configuration
- Fix prompt:
  - Populate next.config.ts with sensible defaults (compress, experimental serverActions if needed, redirects for /marketplace).
  - Acceptance: next build succeeds with no warnings; redirects function.

27) Tests & CI
- Fix prompt:
  - Add minimal API integration tests (agents, tenants, users, security alerts, cameras) and basic Playwright flows (login, portal, admin, toggle agent/camera).
  - Add GitHub Actions workflow for lint, typecheck, build, and tests.
  - Acceptance: CI is green on main.

28) Documentation drift
- Where observed: README is mostly up to date but now includes demo backend; it does not mention Cameras/Security endpoints explicitly.
- Fix prompt:
  Update README with the new APIs (security alerts, scan, cameras), SSE events, tenant behavior, and security caveats; include .env.example and migration notes.
  - Acceptance: README reflects actual implementation; new devs can bring up the demo reliably.


## Quick Fix Snippets (copy‑paste prompts)

A) Create Cameras API
- Path: app/api/cameras/route.ts and app/api/cameras/[id]/toggle/route.ts
- Instruction:
  Build tenant‑scoped cameras endpoints using lib/auth, lib/store, and lib/events. Auto‑init db.cameras as [] when missing. Emit bus "camera_update" after toggle/create. Return JSON shapes: { cameras } for GET; { camera } for POST; { ok, camera|status } for toggle.

B) Create Security Scan API
- Path: app/api/security/scan/route.ts
- Instruction:
  Accept { scope } and create 1–3 alerts in db.securityAlerts; emit bus "security_alert"; return { alerts } created. Use genId("sec").

C) Migrate DB schema on load
- Path: lib/store.ts
- Instruction:
  After JSON.parse in loadDb(), if (!db.securityAlerts) db.securityAlerts = []; if (!db.cameras) db.cameras = []; then saveDb(db) to persist the upgrade.

D) Fix SSE cleanup
- Path: app/api/events/route.ts
- Instruction:
  Implement cancel() that clears the heartbeat interval and bus.off for agent_update, security_alert, camera_update; do not return a function from start().

E) Fix Portal placeholder prop
- Path: app/portal/page.tsx
- Instruction:
  Replace placeholder string with expression: placeholder={audience === 'consumer' ? 'Full Name' : 'Company Name'}

F) Store anchors
- Path: app/store/page.tsx
- Instruction:
  Add placeholder sections with matching ids for #robotics, #drones, #smart-home (or remove the anchor bar).

G) Conditional Admin button
- Path: app/portal/page.tsx
- Instruction:
  Render the Admin link only if me?.user.role is 'admin' or 'reseller'.

H) Harden cookies and CSRF
- Path: lib/auth.ts (+ middleware or per‑route checks)
- Instruction:
  Add secure flag in production; add a simple CSRF token cookie/header check for POST endpoints behind a DEMO_SECURITY=true flag.

I) RSS error handling
- Path: lib/feeds.ts + News/Reviews components
- Instruction:
  Wrap fetch calls in try/catch; on error return []; render fallback UI.

J) Update README and add .env.example
- Paths: README.md, .env.example (new)
- Instruction:
  Document all endpoints (including new ones), demo accounts, SSE, env vars, security notes, and data reset instructions.


## Acceptance Checklist (for sign‑off)
- [ ] Portal Cameras: list, add, toggle work with live SSE updates per tenant
- [ ] Security scans create visible alerts; status updates propagate via SSE
- [ ] No console errors across Home, Store, Portal, Admin, News, Reviews, Tips, Tools
- [ ] Store anchor links scroll to valid sections (or removed)
- [ ] Login flow includes one consolidated quick‑start card; no duplicated headings
- [ ] Placeholder braces bug resolved on Portal
- [ ] SSE endpoint sheds listeners/timers on disconnect
- [ ] RSS fetch failures do not break pages; friendly fallbacks shown
- [ ] Cookies secure in prod; rate limiting on login; basic CSRF for POSTs (demo level)
- [ ] data/db.json auto‑migrates missing arrays; existing data preserved
- [ ] README and .env.example updated; team can run demo from scratch reliably
- [ ] CI passes (lint, type, build, tests); Lighthouse shows acceptable SEO/Perf/A11y

---

If you want me to start implementing, reply with: “Proceed to implement priorities 0–1 now.” I will then create the missing APIs, fix the UI bugs, and update the store migration and SSE cleanup with minimal, well‑scoped PRs.