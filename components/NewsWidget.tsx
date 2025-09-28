import Link from "next/link";
import { fetchNewsCategories, type FeedItem } from "@/lib/feeds";

export default async function NewsWidget({ compact = false }: { compact?: boolean }) {
  const categories = await fetchNewsCategories();
  const sections: { key: string; label: string; items: FeedItem[] }[] = [
    { key: 'ai', label: 'AI', items: categories.ai || [] },
    { key: 'robotics', label: 'Robotics', items: categories.robotics || [] },
    { key: 'autonomous', label: 'Autonomous', items: categories.autonomous || [] },
    { key: 'smarthome', label: 'Smart Home', items: categories.smarthome || [] },
  ];

  return (
    <section className="rounded-xl border p-6 bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Industry News</h2>
        {!compact && (
          <Link href="/news" className="text-sm underline">View all</Link>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((s) => (
          <div key={s.key} className="min-w-0">
            <div className="text-sm text-muted-foreground mb-2">{s.label}</div>
            <ul className="space-y-2 text-sm">
              {s.items.map((it, i) => (
                <li key={i} className="leading-snug">
                  <a href={it.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {truncate(it.title, 90)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
