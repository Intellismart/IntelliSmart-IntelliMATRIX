import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const products = [
  { id: "support-agent", name: "Customer Support Agent", desc: "Omnichannel AI support with auto-ticketing and knowledge base sync.", price: "$49/mo", type: "subscription", img: "https://images.unsplash.com/photo-1581093458791-9d09b0aee399?q=80&w=800&auto=format&fit=crop", anchor: "ai-agents" },
  { id: "sales-agent", name: "Sales SDR Agent", desc: "Prospects, qualifies, and books meetings using compliant outreach.", price: "$79/mo", type: "subscription", img: "https://images.unsplash.com/photo-1677442135703-1787eea5cead?q=80&w=800&auto=format&fit=crop", anchor: "ai-agents" },
  { id: "ops-agent", name: "Ops Automation Agent", desc: "Automates back-office workflows and reconciliations.", price: "$99/mo", type: "subscription", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop", anchor: "ai-agents" },
  { id: "oneoff-analytics", name: "Analytics Pack", desc: "Prebuilt dashboards + KPI monitors for SMBs.", price: "$199", type: "one-time", img: "https://images.unsplash.com/photo-1551281044-8d8d0d8c88ce?q=80&w=800&auto=format&fit=crop", anchor: "analytics" },
];

export default function StorePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">Browse, purchase, and deploy AI Agents, robots, and more.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal"><Button variant="outline">My Portal</Button></Link>
          <Link href="/login"><Button>Sign in</Button></Link>
        </div>
      </header>

      <div className="flex items-center gap-3 text-xs">
        <a href="#ai-agents" className="underline">AI Agents</a>
        <span>•</span>
        <a href="#robotics" className="underline">Robotics</a>
        <span>•</span>
        <a href="#drones" className="underline">Drones</a>
        <span>•</span>
        <a href="#smart-home" className="underline">Smart Home</a>
      </div>

      <section id="ai-agents" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card text-card-foreground flex flex-col overflow-hidden">
            <div className="aspect-[16/10] w-full relative">
              <Image src={p.img} alt={p.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="font-semibold text-lg mb-1">{p.name}</div>
              <div className="text-sm text-muted-foreground mb-4">{p.desc}</div>
              <div className="mt-auto flex items-center justify-between">
                <div className="text-primary font-semibold">{p.price}</div>
                {p.type === "subscription" ? (
                  <Link href={`/portal?subscribe=${p.id}`}><Button size="sm">Subscribe</Button></Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section id="robotics" className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Robotics</h2>
        <p className="text-sm text-muted-foreground">Robotics catalog is coming soon. Explore our AI Agents while we prepare this section.</p>
      </section>

      <section id="drones" className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Drones</h2>
        <p className="text-sm text-muted-foreground">Our drone offerings are in progress. Check back shortly.</p>
      </section>

      <section id="smart-home" className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Smart Home</h2>
        <p className="text-sm text-muted-foreground">Smart home bundles and devices will appear here soon.</p>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">14‑Day Free Trial</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Start building with full access. No credit card required to begin your trial. Cancel anytime.
        </p>
        <Link href="/portal"><Button>Start Free Trial</Button></Link>
      </section>
    </div>
  );
}
