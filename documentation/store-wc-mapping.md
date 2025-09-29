# Store Model Mapping (WooCommerce → IntelliSMART)

This document maps key WooCommerce concepts to data structures and endpoints for IntelliSMART. MVP aims to be
API-compatible in spirit, not a drop-in.

## Entities

- Product
    - id, slug, type: "simple" | "variable"
    - title, description, shortDescription
    - images: string[] (URLs)
    - price: { currency: string; amount: number }
    - salePrice?: number
    - sku?: string
    - stockQty?: number | null (null = manage disabled)
    - status: "draft" | "published"
    - visibility: "catalog" | "search" | "hidden"
    - categories: string[] (category ids)
    - attributes: { name: string; slug: string; options: string[] }[]
    - variations?: Variation[]
    - metadata?: Record<string, unknown>
- Variation
    - id, productId
    - attributes: Record<attrSlug, optionValue>
    - price, salePrice?, sku?, stockQty?
    - image?: string
    - status: "published" | "draft"
- Category
    - id, slug, name, parentId?: string, description?: string, image?: string
- Cart
    - id (session-bound), items: CartItem[], couponCodes: string[], totals
- CartItem
    - productId, variationId?, qty, unitPrice, subtotal
- Coupon
    - code, type: "percent" | "fixed_cart" | "fixed_product"
    - amount, minSpend?, expiresAt?, usageLimit?, perUserLimit?
- Order
    - id, userId, tenantId, number, status, createdAt
    - items: OrderItem[]
    - totals: { items: number; shipping: number; tax: number; discount: number; grand: number }
    - shippingAddress?, billingAddress?, shippingMethod?, payment: Payment
    - transactions: Stripe/Provider ids
- OrderItem
    - productId, variationId?, name, qty, unitPrice, subtotal
- Payment
    - provider: "stripe"
    - intentId?, chargeId?, status: "requires_payment_method" | "requires_confirmation" | "succeeded" | "failed"

## Collections (DbSchema additions)

- storeProducts: Product[]
- storeCategories: Category[]
- storeCoupons: Coupon[]
- storeOrders: Order[]

Note: For demo we extend the single-document JSON/Mongo store with these arrays. For production, move to a relational DB
with proper indexing.

## Endpoints (REST-inspired)

- GET /api/store/products?search=&category=&page=&limit=
- GET /api/store/products/[slug]
- GET /api/store/categories
- GET /api/store/categories/[slug]
- GET /api/cart
- POST /api/cart { productId, variationId?, qty }
- PATCH/DELETE /api/cart/items/[index]
- POST /api/checkout/create-intent { cart }
- POST /api/checkout/confirm { orderId }
- POST /api/webhooks/stripe
- GET /api/orders (current user)
- GET /api/orders/[id]
- Admin:
    - GET/POST /api/admin/store/products
    - PUT/DELETE /api/admin/store/products/[id]
    - GET/POST /api/admin/store/categories
    - PUT/DELETE /api/admin/store/categories/[id]
    - GET /api/admin/store/orders
    - GET /api/admin/store/orders/[id]

## Pages

- /store — catalog grid with filters
- /store/c/[slug] — category listing
- /store/p/[slug] — product details with add to cart
- /cart — review + update items
- /checkout — address, method, payment
- /account/orders — order history
- /admin/store/products — product management
- /admin/store/orders — order management

## Behavior & Rules

- Inventory decrease on order paid; restore on cancel/refund.
- Prices in cents (integers) to avoid float math issues.
- Tax and shipping strategies pluggable; MVP provides simple implementations.
- Coupons validate against min spend, product/category scope (M2), and expiration.

## SEO

- Product and category slugs are unique within tenant scope.
- Sitemap includes /store/p/* and /store/c/* URLs.

## Multi-tenant Considerations

- All store collections are tenant-scoped. Resellers/admins may operate across tenants based on RBAC.

## Migration Plan

- Extend DbSchema with optional arrays to maintain backward compatibility.
- Seed with a few sample products/categories to render storefront.
