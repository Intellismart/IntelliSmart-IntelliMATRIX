# Autonomous Delivery — Where to Find It

Date: 2025-09-29
Owner: Product & Engineering
Scope: Explains how "autonomous delivery" is represented in the demo app, where to access it in the UI, and which APIs/events to use.

## What it is in this demo
- Autonomous delivery vehicles are modeled as Transports with kind = "delivery".
- Transports can be created, listed, and have their status changed (pending → approved → active → inactive).
- Status updates are broadcast over Server‑Sent Events so the Portal updates in real time.

## Where to access it
- Public page: /delivery — Overview + quick links.
- Customer Portal (protected): /portal — Transports panel to add and manage delivery vehicles.
- Store: /store#robotics — Browse robotics category (marketing/demo only).

## Relevant APIs (require authentication)
- GET  /api/transports — list transports for the active tenant
- POST /api/transports — create a transport
  - body: { vehicleId?: string; kind?: "shuttle" | "rover" | "robotaxi" | "delivery"; location?: string }
- POST /api/transports/:id/status — change status
  - body: { status: "pending" | "approved" | "active" | "inactive" }

Example calls:
```ts
await fetch('/api/transports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vehicleId: 'DELIV-001', kind: 'delivery', location: 'HQ' })
});

await fetch('/api/transports/TRANSPORT_ID/status', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' })
});
```

## Real‑time Events
- Subscribe: GET /api/events (text/event-stream)
- Event types:
  - agent_update
  - security_alert
  - camera_update
  - transport_update ← emitted on transport status changes

Client snippet:
```ts
const es = new EventSource('/api/events');
es.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'transport_update') {
    console.log('Transport update', msg.payload);
  }
};
```

## Data Model
- Transport: { id, tenantId, vehicleId, kind, status, location?, updatedAt }
- Stored in: data/db.json under `transports` array.

## Notes
- This is a demo; no real vehicle control is performed.
- Tenancy and roles apply: you must select or belong to a tenant to see/manage transports.
