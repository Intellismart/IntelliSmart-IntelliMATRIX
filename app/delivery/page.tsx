import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AutonomousDeliveryPage() {
  return (
    <div className="space-y-8">
      <header className="grid gap-6 lg:grid-cols-2 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Autonomous Delivery</h1>
          <p className="text-muted-foreground text-lg max-w-prose">
            Plan, approve, and monitor autonomous delivery vehicles in your Customer Portal. This demo models delivery fleets using the Transports API and streams real‑time status updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/portal"><Button size="lg">Open Customer Portal</Button></Link>
            <Link href="/store#robotics"><Button size="lg" variant="outline">Browse Robotics</Button></Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border relative">
            <Image
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1600&auto=format&fit=crop"
              alt="Autonomous delivery robot on sidewalk"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </header>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">How it works in this demo</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Transports represent vehicles (shuttle, rover, robotaxi, delivery).</li>
          <li>Create and manage transports via protected API routes under <code>/api/transports</code>.</li>
          <li>Status changes emit real‑time events over Server‑Sent Events (SSE) to connected portals.</li>
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-1">Create a Delivery Vehicle</div>
          <p className="text-sm text-muted-foreground mb-3">POST /api/transports with kind:"delivery" (requires sign‑in).</p>
          <CodeBlock>
            {`fetch('/api/transports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vehicleId: 'DELIV-001', kind: 'delivery', location: 'HQ' })
});`}
          </CodeBlock>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-1">Update Status</div>
          <p className="text-sm text-muted-foreground mb-3">POST /api/transports/:id/status with {`{ status }`}.</p>
          <CodeBlock>
            {`fetch('/api/transports/TRANSPORT_ID/status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});`}
          </CodeBlock>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-1">Real‑time Updates</div>
          <p className="text-sm text-muted-foreground mb-3">Subscribe to /api/events to receive transport_update events.</p>
          <CodeBlock>
            {`const es = new EventSource('/api/events');
es.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'transport_update') {
    // handle msg.payload { tenantId, transportId, status }
  }
};`}
          </CodeBlock>
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Where to find it</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Customer Portal → Transports panel (per‑tenant, protected).</li>
          <li>APIs: <code>GET/POST /api/transports</code>, <code>POST /api/transports/:id/status</code>, events via <code>GET /api/events</code>.</li>
        </ul>
        <div className="mt-4">
          <Link href="/portal"><Button>Go to Portal</Button></Link>
        </div>
      </section>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-md border bg-muted p-3 text-xs overflow-auto"><code>{children}</code></pre>
  );
}
