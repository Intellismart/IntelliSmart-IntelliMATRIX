# Site Design — IntelliSMART AI Factory (as-built)

1. Design Goals
- High-tech, modern feel for AI/robotics audience
- Fast perceived performance, clear information hierarchy
- Responsive across mobile → desktop; keyboard-friendly
- Minimal components with Tailwind utilities for maintainability

2. Layout & Navigation
- Root layout: app/layout.tsx applies dark theme and fonts; contains Navbar and main container.
- Navbar: sticky top, subtle blur, horizontally scrollable on small screens; primary nav left, user session controls right.
- Main content: container mx-auto with consistent page paddings (px-4, py-6). Cards and sections use rounded-xl borders and background contrast.

3. Typography & Icons
- Fonts: Geist (sans) and Geist Mono via next/font/google
- Headings: bold, tight tracking on hero titles; body uses muted-foreground for secondary text
- Iconography: lucide-react available; sparingly used (current UI is mostly text-first)

4. Color & Theming
- Dark-first palette using Tailwind CSS variables from the Next.js starter
- Emphasis colors: primary for CTAs; accent hover states and borders for card delineation
- Gradients: hero background uses indigo → fuchsia radial gradients to convey “high-tech”

5. Components & Patterns
- Button (components/ui/button.tsx)
  - Variants: default, outline, secondary, ghost, destructive, link
  - Sizes: sm, default, lg, icon
  - Class-variance-authority to consolidate Tailwind class permutations
- Cards (pattern)
  - Rounded-xl, border, bg-card/text-card-foreground; internal spacing p-4/6
- Grids
  - Responsive grids: e.g., Featured Categories (md:2, lg:4), sections (lg:2/3)
- Widgets
  - News/Reviews/Tips as server components fetching data in lib/feeds.ts
- Forms
  - Minimal inputs using border + bg-background; text-sm; no external form lib

6. Pages & IA Highlights
- Home
  - Hero with dual CTAs (Shop, Portal)
  - Featured Categories grid with curated imagery (Unsplash) for AI Agents, Robotics, Drones, Smart Home, High‑Tech Tools, Toys
  - Dynamic widgets (News/Reviews/Tips)
- Store
  - Product-card grid with name, description, price, and CTA (Subscribe / disabled Add to Cart)
  - Category anchors for quick navigation
- Portal
  - Audience toggle (Business/Consumer/Reseller) above KPI cards
  - Domain cards for IoT, Robots, Drones, Smart Home, Cybersecurity, Camera Security
  - Agents management list with Start/Stop
  - Training data upload stub and Subscription panel
- Admin
  - Tiles for User/Permissions/Security/Billing/Inventory/Site
  - Tenants create/list and Users invite/list tables
- Support, Resellers, Tools, etc.
  - Simple content cards with CTAs; placeholders for expansion

7. Responsiveness
- Navigation supports overflow-x-auto on small screens
- Grids collapse to single/two columns at narrow widths
- Images use aspect-ratio wrappers to avoid layout shifts

8. Accessibility
- Focus-visible rings on buttons
- Buttons/links sized for touch targets; semantic tags for navigation and headings
- Alt text for hero and category images
- Areas for improvement: landmarks for main/nav; ARIA on toggle groups; richer focus states on custom controls

9. Performance Considerations
- Server components for RSS widgets reduce client JS
- Caching with next: { revalidate: 86400 } on RSS fetches
- Minimal external dependencies; no client state libraries

10. SEO & Metadata
- Basic per-page metadata on News/Reviews/Tips/Support/Resellers
- Areas for improvement: structured data for products, Open Graph images, sitemap.xml/robots.txt generation, canonical URLs

11. Theming/Branding Extensibility
- Colors and rounded/border styles centralized via Tailwind utility usage
- Navbar, Card, and Button patterns support straightforward brand customization

12. Known UI Limitations & Backlog
- Limited use of icons/illustrations beyond imagery
- No light-mode toggle; dark-only
- Placeholders for many tools and marketplace flows
- Cart/checkout not implemented; only subscription CTA navigations
