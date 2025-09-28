import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Configure billing, inventory, roles, permissions, and site settings.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal"><Button variant="outline">Customer Portal</Button></Link>
          <Link href="/store"><Button variant="outline">Marketplace</Button></Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="User Management" desc="Invite, deactivate, and assign roles to users.">
          <div className="flex gap-2">
            <Button size="sm">Invite User</Button>
            <Button size="sm" variant="outline">Roles</Button>
          </div>
        </AdminCard>

        <AdminCard title="Permissions" desc="Role-based access control and least-privilege policies.">
          <div className="flex gap-2">
            <Button size="sm">Policy Editor</Button>
            <Button size="sm" variant="outline">Audit</Button>
          </div>
        </AdminCard>

        <AdminCard title="Security" desc="Zero-trust posture: SSO, MFA, IP allowlists, secrets management.">
          <div className="flex gap-2">
            <Button size="sm">SSO</Button>
            <Button size="sm" variant="outline">MFA</Button>
          </div>
        </AdminCard>

        <AdminCard title="Billing" desc="Plans, invoices, payments, and dunning settings.">
          <div className="flex gap-2">
            <Button size="sm">Open Billing</Button>
            <Button size="sm" variant="outline">Coupons</Button>
          </div>
        </AdminCard>

        <AdminCard title="Inventory / Stock" desc="Manage marketplace SKUs and availability.">
          <div className="flex gap-2">
            <Button size="sm">New SKU</Button>
            <Button size="sm" variant="outline">Sync</Button>
          </div>
        </AdminCard>

        <AdminCard title="Site Management" desc="Branding, domains, locales, and maintenance mode.">
          <div className="flex gap-2">
            <Button size="sm">Branding</Button>
            <Button size="sm" variant="outline">Domains</Button>
          </div>
        </AdminCard>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">System Health</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <HealthItem label="API" status="Operational" />
          <HealthItem label="Billing" status="Operational" />
          <HealthItem label="Vector DB" status="Degraded" />
          <HealthItem label="Orchestrator" status="Operational" />
        </div>
      </section>
    </div>
  );
}

function AdminCard({ title, desc, children }: { title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-6 bg-card text-card-foreground">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-muted-foreground mb-4">{desc}</div>
      {children}
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-lg border p-4 flex items-center justify-between">
      <div className="text-muted-foreground">{label}</div>
      <div className={status === "Operational" ? "text-green-500" : "text-yellow-500"}>{status}</div>
    </div>
  );
}
