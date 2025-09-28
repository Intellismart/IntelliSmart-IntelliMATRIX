import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Support • IntelliSMART AI Factory",
  description: "Get help with AI agents, robots, drones, and smart home devices.",
};

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground">We’re here to help with setup, billing, and troubleshooting.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal"><Button variant="outline">Customer Portal</Button></Link>
          <Link href="/store"><Button variant="outline">Shop</Button></Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">AI Agents</div>
          <div className="text-sm text-muted-foreground mb-3">Deploy, train, and monitor your agents.</div>
          <Button size="sm">Open Guides</Button>
        </div>
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">Devices & Robots</div>
          <div className="text-sm text-muted-foreground mb-3">Onboarding, routines, and safety.</div>
          <Button size="sm">Troubleshoot</Button>
        </div>
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="font-semibold mb-1">Billing</div>
          <div className="text-sm text-muted-foreground mb-3">Invoices, subscriptions, and trials.</div>
          <Button size="sm">Contact Billing</Button>
        </div>
      </section>

      <footer className="text-sm text-muted-foreground">
        Email <a className="underline" href="mailto:support@example.com">support@example.com</a> or check the <Link href="/news" className="underline">latest news</Link>.
      </footer>
    </div>
  );
}
