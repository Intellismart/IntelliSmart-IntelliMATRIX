"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Tenant = { id: string; name: string };
type User = { id: string; email: string; name: string; role: string; tenantId?: string };

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tenantName, setTenantName] = useState("");
  const [invite, setInvite] = useState<{ email: string; name: string; role: string; tenantId: string }>({ email: "", name: "", role: "business", tenantId: "" });

  async function loadData() {
    const [t, u] = await Promise.all([
      fetch("/api/tenants").then(r => r.json()).catch(() => ({ tenants: [] })),
      fetch("/api/users").then(r => r.json()).catch(() => ({ users: [] })),
    ]);
    setTenants(t.tenants || []);
    setUsers(u.users || []);
  }

  useEffect(() => { loadData(); }, []);

  async function createTenant() {
    if (!tenantName) return;
    await fetch('/api/tenants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tenantName }) });
    setTenantName("");
    await loadData();
  }

  async function inviteUser() {
    if (!invite.email || !invite.name || !invite.role) return;
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invite) });
    setInvite({ email: "", name: "", role: "business", tenantId: "" });
    await loadData();
  }

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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-3">Tenants</h2>
          <div className="flex gap-2 mb-4">
            <input className="rounded-md border bg-background p-2 text-sm flex-1" placeholder="New tenant name" value={tenantName} onChange={(e)=>setTenantName(e.target.value)} />
            <Button size="sm" onClick={createTenant}>Create</Button>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 max-h-48 overflow-auto">
            {tenants.map(t => (
              <li key={t.id} className="flex items-center justify-between border-b last:border-none py-1">
                <span>{t.name} <span className="text-xs text-muted-foreground">({t.id})</span></span>
                <Link href={`/portal?mode=business`} className="underline text-xs">Open</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-3">Users</h2>
          <div className="grid gap-2 sm:grid-cols-2 mb-3">
            <input className="rounded-md border bg-background p-2 text-sm" placeholder="Email" value={invite.email} onChange={(e)=>setInvite({ ...invite, email: e.target.value })} />
            <input className="rounded-md border bg-background p-2 text-sm" placeholder="Name" value={invite.name} onChange={(e)=>setInvite({ ...invite, name: e.target.value })} />
            <select className="rounded-md border bg-background p-2 text-sm" value={invite.role} onChange={(e)=>setInvite({ ...invite, role: e.target.value })}>
              <option value="business">Business</option>
              <option value="consumer">Consumer</option>
              <option value="reseller">Reseller</option>
              <option value="admin">Admin</option>
            </select>
            <select className="rounded-md border bg-background p-2 text-sm" value={invite.tenantId} onChange={(e)=>setInvite({ ...invite, tenantId: e.target.value })}>
              <option value="">Select Tenant (optional)</option>
              {tenants.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <Button size="sm" onClick={inviteUser}>Invite</Button>

          <div className="mt-4 max-h-48 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1 pr-2">Name</th>
                  <th className="py-1 pr-2">Email</th>
                  <th className="py-1 pr-2">Role</th>
                  <th className="py-1">Tenant</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="py-1 pr-2">{u.name}</td>
                    <td className="py-1 pr-2">{u.email}</td>
                    <td className="py-1 pr-2">{u.role}</td>
                    <td className="py-1">{u.tenantId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
