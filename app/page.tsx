import Link from "next/link";
import { Button } from "@/components/ui/button";
import NewsWidget from "@/components/NewsWidget";
import TipsWidget from "@/components/TipsWidget";
import ReviewsWidget from "@/components/ReviewsWidget";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-900/60 via-background to-fuchsia-900/40">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(ellipse at top left, rgba(99,102,241,0.5), transparent 35%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.45), transparent 35%)'}} />
        <div className="grid gap-6 lg:grid-cols-2 items-center p-8 lg:p-12 relative">
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI, Robotics & High‑Tech Store</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Deploy cutting‑edge AI agents, robots, drones, smart home tech, high‑tech tools, and toys. Manage everything in one powerful portal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/store"><Button size="lg">Shop the Latest</Button></Link>
              <Link href="/portal"><Button size="lg" variant="outline">Customer Portal</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border">
              <img
                src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop"
                alt="Futuristic robot with glowing accents"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <img className="rounded-lg border object-cover h-28 w-full" src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop" alt="Drone" />
              <img className="rounded-lg border object-cover h-28 w-full" src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop" alt="Smart home" />
              <img className="rounded-lg border object-cover h-28 w-full" src="https://images.unsplash.com/photo-1581092919553-1fb0f6f3c47f?q=80&w=800&auto=format&fit=crop" alt="Circuit AI" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <h2 className="font-semibold mb-3">Featured Categories</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CategoryCard title="AI Agents" desc="Deploy sales, support, and ops agents." href="/store#ai-agents" img="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop" />
          <CategoryCard title="Robotics" desc="Shop service and hobby robots." href="/store#robotics" img="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop" />
          <CategoryCard title="Drones" desc="Autonomous and FPV drones." href="/store#drones" img="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop" />
          <CategoryCard title="Smart Home" desc="Robovacs, hubs, automation." href="/store#smart-home" img="https://images.unsplash.com/photo-1573167243877-cb89e39749d7?q=80&w=1200&auto=format&fit=crop" />
          <CategoryCard title="High‑Tech Tools" desc="Testers, sensors, dev kits." href="/store#tools" img="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" />
          <CategoryCard title="Toys" desc="STEM kits, smart toys, fun bots." href="/store#toys" img="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" />
        </div>
      </section>

      {/* Dynamic widgets */}
      {/* @ts-expect-error Async Server Component */}
      <NewsWidget />
      {/* @ts-expect-error Async Server Component */}
      <ReviewsWidget />
      {/* @ts-expect-error Async Server Component */}
      <TipsWidget />
    </div>
  );
}

function CategoryCard({ title, desc, href, img }: { title: string; desc: string; href: string; img: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4 bg-card text-card-foreground">
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}