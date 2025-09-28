import { fetchNewsCategories, type FeedItem } from "@/lib/feeds";

export const metadata = {
  title: "Industry News • IntelliSMART AI Factory",
  description: "Latest AI, Robotics, Autonomous Vehicles, and Smart Home news aggregated daily.",
};

export default async function NewsPage() {
  const cats = await fetchNewsCategories();
  const sections: { key: string; label: string; items: FeedItem[] }[] = [
    { key: 'ai', label: 'AI', items: cats.ai || [] },
    { key: 'robotics', label: 'Robotics', items: cats.robotics || [] },
    { key: 'autonomous', label: 'Autonomous Vehicles', items: cats.autonomous || [] },
    { key: 'smarthome', label: 'Smart Home', items: cats.smarthome || [] },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Industry News</h1>
        <p className="text-muted-foreground">Aggregated from top sources and Google News, refreshed daily.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <section key={s.key} className="rounded-xl border p-6 bg-card text-card-foreground">
            <h2 className="font-semibold mb-3">{s.label}</h2>
            <ul className="space-y-2 text-sm">
              {s.items.map((it, i) => (
                <li key={i} className="leading-snug">
                  <a href={it.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {it.title}
                  </a>
                  {it.pubDate && <span className="text-muted-foreground"> — {new Date(it.pubDate).toLocaleDateString()}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
