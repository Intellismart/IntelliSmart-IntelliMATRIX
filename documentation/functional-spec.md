# Functional Specification: IntelliSMART Commerce (WooCommerce-style)

This document enumerates the required features and tasks to make the application fully functional from user sign-up
through completed orders, using a WooCommerce-style model.

## 1) User Sign-up to Onboarding

- Sign-up page (/signup) with account type selection: Business or Consumer. ✓
- API: POST /api/signup — creates user, bootstraps tenant, and starts session. ✓
- Email verification (stub in dev; provider integration later).
- Onboarding wizard for new business tenants: choose plan (trial), invite teammates, and quick-start tasks.
- Password reset (request + confirm) and change password while logged in.

Deliverables:

- Pages: /signup, /onboarding (wizard)
- APIs: /api/signup, /api/password/reset (request), /api/password/confirm (confirm)
- Email templates (verification, reset)

## 2) Roles & RBAC

- Roles: admin, reseller, business, consumer (already present). ✓
- Tenant ownership for business sign-ups; consumer has personal tenant. ✓ (basic)
- Admin & reseller permissions to manage products/orders/config for their scope.
- Resource-level checks on store endpoints.

## 3) Catalog (WooCommerce-style)

- Product types: simple and variable.
- Product fields: id, slug, title, description, images, price, salePrice, sku, stockQty, status (draft/published),
  visibility, attributes.
- Categories and nested categories with slugs.
- Attributes (e.g., Size, Color) and Product Variations (combinations with own price/sku/stock).
- Inventory management: stock reduce on order, low-stock threshold.
- Product reviews/ratings (optional MVP).

Deliverables:

- Data model extensions (see Store Model Mapping)
- Admin CRUD UI for products and categories
- Media management for product images (stub with URL inputs for MVP)

## 4) Storefront UX

- Routes:
    - /store — catalog grid with filters/facets, pagination
    - /store/c/[categorySlug] — category listing
    - /store/p/[slug] — product details page with variations, add-to-cart
    - /search — keyword search
- Breadcrumbs, sorting, related products, recently viewed (optional).

## 5) Cart & Checkout

- Cart persisted in session (cookie/sessionId).
- Endpoints: GET/POST /api/cart; PATCH/DELETE for items.
- Checkout steps: shipping address, method, tax estimate, payment.
- Guest checkout (optional) vs sign-in required (MVP: require sign-in).
- Coupons/discounts applied at cart/checkout.

## 6) Orders

- Order lifecycle: pending → paid → processing → fulfilled → completed; also canceled/refunded.
- Order structure: items (qty, unit price, subtotal), shipping, taxes, discounts, grand total, payment status.
- Customer: /account/orders (list + details)
- Admin: /admin/orders (list + details, status updates, refunds)

## 7) Payments (Stripe)

- Create PaymentIntent during checkout.
- Webhook handler updates order status to paid, stores transaction ids.
- Test cards in dev; env vars for keys and webhook secret.

## 8) Shipping & Tax

- Shipping methods: flat rate, free over threshold (MVP).
- Simple tax calculator by country/state/zip (demo rates) with extensible interface.

## 9) Coupons

- Codes with percentage/fixed discounts, min spend, expiration, usage limits.

## 10) Email Notifications

- Events: sign-up verification, order confirmation, fulfillment, password reset.
- Provider abstraction: dev logger, production adapter (e.g., Resend/SES).

## 11) CMS Integration

- Use existing CMS to compose category landing content and site pages (FAQ, Policies).
- SEO metadata for products and categories.

## 12) Search & SEO

- Slugs, canonical tags, open graph, sitemap.xml entries for products/categories.

## 13) Security & Compliance

- Hash passwords (bcrypt/argon2) and remove plaintext from store (MVP keeps demo, document risk).
- CSRF tokens on POST forms; input validation; rate limits; audit logs.
- Data export/delete plan (GDPR).

## 14) Testing & CI

- Unit tests: pricing, cart math, coupon logic.
- Integration: signup/login/cart/checkout order creation.
- Webhook signature verification tests.

## 15) Deployment

- Env: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, EMAIL_*.
- README updates and .env.example complete.

---

Milestones:

- MVP: Sign-up, catalog read, cart, simple checkout with Stripe test, orders; admin product CRUD.
- Phase 2: coupons, shipping/tax refinements, reviews, email provider, SEO, a11y, tests.
