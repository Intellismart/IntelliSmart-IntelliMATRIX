# IntelliSMART AI Factory - AI Agent Instructions

## Project Overview

IntelliSMART is a Next.js-based e-commerce platform for AI, robotics, and smart home technology with multi-tenant
support. Key technologies:

- Next.js 15 (App Router) with TypeScript 5
- File-based persistence (data/db.json)
- Server-Sent Events (SSE) for real-time updates
- Role-based access control (RBAC) with multi-tenant isolation

## Architecture Patterns

### Auth & Sessions (`lib/auth.ts`)

- Cookie-based sessions with HMAC signatures
- Session payload: `{ userId, role, tenantId?, iat }`
- Guards: Use `requireAuth()` for API routes with optional `minRole` parameter
- Example:

```typescript
// API route guard pattern
export async function GET() {
  const session = await requireAuth({ minRole: 'business' });
  // session.userId and session.tenantId available here
}
```

### Multi-Tenant Data Access

- All data operations MUST filter by tenant
- Business/Consumer users bound to their tenantId
- Resellers can switch between managedTenantIds
- Admins can access any tenant
- Example pattern from agent APIs:

```typescript
const agents = db.agents.filter(a => a.tenantId === session.tenantId);
```

### Real-time Events (`lib/events.ts`)

- Use SSE for live updates via `/api/events`
- Event types: agent_update, security_alert, camera_update
- Events filtered by tenant server-side
- Include `tenantId` in all event payloads
- Portal components auto-refresh on relevant events

### File-based Persistence

- Schema defined in `lib/types.ts`
- Atomic writes with tmp+rename pattern
- Collections: tenants[], users[], agents[], securityAlerts[], cameras[]
- Delete `data/db.json` to reset to seed data

## Developer Workflows

### Local Development

1. `npm install`
2. `npm run dev`
3. Visit http://localhost:3000/login
4. Use quick login buttons (admin@acme.co/admin, ops@acme.co/demo)

### Adding New API Routes

1. Create route file in `app/api/[feature]/route.ts`
2. Import auth guard: `import { requireAuth } from '@/lib/auth'`
3. Add tenant filtering for data operations
4. For real-time events, emit via `events.ts`

### Adding New Pages

1. Create page in `app/[route]/page.tsx`
2. Protected routes need middleware auth check
3. For real-time updates, subscribe to SSE in client components
4. Use shared UI components from `components/ui/`

## Common Patterns

### Role-Based Access

- Roles: admin, reseller, business, consumer
- Check roles in API routes with `requireAuth({ minRole: 'xyz' })`
- UI components can check `session.role` for conditional rendering
- Tenant switching only available to admin/reseller roles

### SSE Integration

```typescript
// Client component pattern
useEffect(() => {
  const events = new EventSource('/api/events');
  events.addEventListener('agent_update', (e) => {
    // Handle update
  });
  return () => events.close();
}, []);
```

### Database Operations

```typescript
import { writeDb, db } from '@/lib/store';

// Read with tenant filter
const items = db.collection.filter(x => x.tenantId === session.tenantId);

// Write with atomic update
await writeDb(db => {
  db.collection.push({ id: uuid(), tenantId: session.tenantId, ...data });
});
```

## Integration Points

- Authentication: `lib/auth.ts` (replaceable with NextAuth)
- Database: `lib/store.ts` (JSON file, replaceable with Prisma)
- Events: `lib/events.ts` (SSE implementation)
- External feeds: `lib/feeds.ts` (News/Reviews aggregation)

## Key Files & Directories

- `app/api/*` - Route handlers with tenant isolation
- `lib/*.ts` - Core services and type definitions
- `components/ui/*` - Shared UI components
- `data/db.json` - File-based database
- `documentation/*.md` - Detailed technical specs