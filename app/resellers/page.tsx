import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Reseller Program • IntelliSMART AI Factory",
  description: "Partner with us to resell AI agents and devices.",
};

export default function ResellersPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reseller Program</h1>
          <p className="text-muted-foreground">Provision client workspaces, manage margins, and deliver AI solutions fast.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal?mode=reseller"><Button variant="outline">Reseller Portal</Button></Link>
          <Link href="/store"><Button variant="outline">Shop</Button></Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">White‑label Agents</div>
          <div className="text-sm text-muted-foreground mb-3">Deploy our agents with your branding for clients.</div>
          <Button size="sm">View Catalog</Button>
        </div>
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">Provisioning</div>
          <div className="text-sm text-muted-foreground mb-3">Create new client tenants and apply templates.</div>
          <Button size="sm">Create Tenant</Button>
        </div>
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">Margins & Billing</div>
          <div className="text-sm text-muted-foreground mb-3">Manage discounts, margins, and consolidated invoices.</div>
          <Button size="sm">Open Billing</Button>
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Become a Partner</h2>
        <p className="text-sm text-muted-foreground mb-3">Apply to our reseller program and get access to enablement, demo environments, and co‑marketing.</p>
        <Button>Apply Now</Button>
      </section>
    </div>
  );
}
