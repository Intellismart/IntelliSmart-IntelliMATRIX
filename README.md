# IntelliSMART AI Factory

Dynamic e‑commerce scaffold for AI, Robotics, Autonomous Vehicles, and Smart Home.
Built with Next.js (App Router) and lightweight server components.

## Feature Map / Routes
- Home (`/`, app/page.tsx): High‑tech gradient hero, curated imagery, Featured Categories (AI Agents, Robotics, Drones, Smart Home, High‑Tech Tools, Toys), plus dynamic widgets for Industry News, Reviews, and Hints & Tips.
- Shop (`/store`, app/store/page.tsx): Product cards with imagery and anchors for quick navigation. Includes 14‑day trial CTA.
- News (`/news`, app/news/page.tsx): Aggregated AI/Robotics/Autonomous/Smart Home news from public RSS (daily refresh).
- Reviews (`/reviews`, app/reviews/page.tsx): Latest reviews (Engadget, TechRadar) aggregated daily.
- Tips (`/tips`, app/tips/page.tsx): Curated best practices rotating daily, deterministically.
- Customer Portal (`/portal`, app/portal/page.tsx): Audience modes (Business, Consumer, Reseller), IoT/Robots/Drones/Smart Home sections, KPIs, agent controls, training data upload stub, subscription/account panels, monitoring/activity.
- Resellers (`/resellers`, app/resellers/page.tsx): Program overview, actions for catalog, provisioning, and billing.
- Support (`/support`, app/support/page.tsx): Help overview and quick links.
- Admin (`/admin`, app/admin/page.tsx): Placeholders for user management, permissions, security, billing, stock/agents, and site management.

Auxiliary/placeholder pages to avoid 404s and for future expansion:
- Tools (`/tools`)
- Marketplace alias (`/marketplace`) → links to Store
- Custom Login (`/custom-login`)
- Tenant Login (`/tenant-login`)
- Contact (`/contact`)
- Forum (`/forum`)
- Login (`/login`)

### Top Navigation
Home • Shop • News • Reviews • Tips • Support • Portal • Resellers

## Dynamic Content & Caching
- News/Reviews are fetched on the server from public RSS sources and cached by Next.js with daily revalidation.
- Tips are local and rotate daily without external calls using a deterministic day index.

## Images
Curated Unsplash images are used for demo purposes only.

## Getting Started
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Visit http://localhost:3000 and use the navbar to explore pages.

You can edit pages in the `app/` directory; the page auto‑updates as you edit.

## Changelog (since first revision)
- Replaced initial navigation with a store‑oriented top menu: Home, Shop, News, Reviews, Tips, Support, Portal, Resellers.
- Built a dynamic Home page: gradient hero, curated imagery, Featured Categories.
- Added Featured Categories “High‑Tech Tools” and “Toys”.
- Implemented dynamic widgets: Industry News, Reviews, and Hints & Tips.
- Added server‑side RSS aggregation with daily caching (Google News, Engadget, TechRadar).
- Expanded Customer Portal with Business/Consumer/Reseller modes; domain sections (IoT, Robots, Drones, Smart Home); KPIs; agent controls; training data stub; subscription/account; monitoring.
- Created Support and Resellers pages.
- Added Admin console scaffold.
- Added auxiliary routes and placeholders to prevent 404s: Tools, Marketplace alias, Custom/Tenant Login, Contact, Forum, Login.

## Roadmap / Next Steps
- Integrate authentication (e.g., NextAuth) and role‑based access control.
- Implement subscriptions with a provider (Stripe), including 14‑day trial logic.
- Build marketplace cart/checkout and product management.
- Add zero‑trust connectors and audit logging for data access.
- Implement agent runtime controls, metrics, and training data ingestion APIs.
- Harden security, permissions, and admin tooling.


---

## Production Demo Backend (added)
This repository now includes a working production demo backend suitable for user testing:
- Auth: cookie sessions with signed tokens and demo accounts.
- Tenancy: per-tenant scoping for agents/users with reseller multi-tenant support.
- RBAC: role-aware endpoints (admin, reseller, business, consumer).
- Real‑time: Server‑Sent Events stream for live agent status updates.
- Persistence: MongoDB (optional via env) or file‑based JSON fallback (data/db.json) with atomic writes and seed data.
- Middleware: protects /portal and /admin (redirects to /login if unauthenticated).

### Demo Accounts
- Admin: admin@acme.co / admin
- Business: ops@acme.co / demo
- Consumer: consumer@example.com / demo
- Reseller: reseller@example.com / demo

Use the quick login buttons on /login to try these instantly.

### Key API Endpoints
- POST /api/login — sign in and set session cookie
- POST /api/logout — clear session
- GET  /api/me — current user + active tenant
- GET/POST /api/agents — list/create agents in active tenant
- POST /api/agents/:id/toggle — start/stop an agent (emits SSE event)
- GET  /api/events — SSE stream (agent_update, heartbeat)
- GET/POST /api/tenants — list/create tenants (admin/reseller)
- POST /api/tenant/select — set active tenant (admin/reseller)
- GET/POST /api/users — list/invite users (admin/reseller; tenant-scoped)

### Admin & Portal Enhancements
- Admin now lists tenants and users with inline create/invite forms.
- Portal loads agents from the backend, toggles via API, and stays in sync through SSE.
- Resellers/Admins can switch the active tenant from within the Portal.
- Navbar shows current role and tenant; includes Sign out.

### Running the Demo
1) npm install
2) npm run dev
3) Visit http://localhost:3000/login and click a quick login (e.g., Admin).
4) Open /portal to manage agents. Start/Stop updates stream in real time.
5) As a Reseller or Admin, open the Tenant selector in Portal to switch tenants.
6) Open /admin to create tenants and invite users.

Notes:
- This is a demo; credentials are stored in data/db.json in plain text.
- SSE works per-tenant. Multiple browser windows signed into the same tenant will all update.
- The file store persists between restarts (data/db.json). Delete it to reseed.

### What’s Next (beyond demo)
- Replace demo auth with NextAuth/SSO; hash passwords; add CSRF.
- Move persistence to a durable DB (e.g., Postgres + Prisma) and add migrations.
- Add audit logs, rate limits, and permissions enforcement at resource level.
- Implement billing (Stripe), marketplace checkout, and device/agent runtimes.

## MongoDB Setup (optional)

If you want to persist data to MongoDB instead of the local JSON file:

1. Install dependencies: npm install
2. Provision a MongoDB instance (e.g., MongoDB Atlas or local mongod).
3. Create a .env file at the project root with:
    - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
    - MONGODB_DB=intellitrader
4. Start the app: npm run dev

Notes:

- When MONGODB_URI is set, the app stores the entire application state in a single document in collection "appstate"
  with _id="db".
- On first run, seed data will be inserted automatically if the document does not exist.
- If MONGODB_URI is not set, the app falls back to data/db.json.

## Auth Setup

- Sessions use an HMAC-signed cookie named `session`. For local/dev you can omit `SESSION_SECRET`; in production set a
  strong random value.
- Demo accounts (email/password) are seeded into the store. Passwords are plain text for demo only.

Environment variables (.env):

- SESSION_SECRET=your-strong-random-string

Flow:

1) POST /api/login with { email, password } → sets session cookie
2) Access protected pages (/portal, /admin) and APIs
3) Optional: POST /api/tenant/select to switch active tenant (admin/reseller)
4) POST /api/logout to clear session
