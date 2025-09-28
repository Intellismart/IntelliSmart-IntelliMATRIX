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
