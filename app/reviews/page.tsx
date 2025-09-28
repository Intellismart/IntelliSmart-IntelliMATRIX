import { fetchReviewsFeeds } from "@/lib/feeds";

export const metadata = {
  title: "Tech Reviews • IntelliSMART AI Factory",
  description: "Latest reviews across AI gear, robots, drones, and smart home, aggregated daily.",
};

export default async function ReviewsPage() {
  const items = await fetchReviewsFeeds();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Tech Reviews</h1>
        <p className="text-muted-foreground">From Engadget and TechRadar, refreshed daily.</p>
      </header>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <ul className="space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="leading-snug">
              <a href={it.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {it.title}
              </a>
              {it.source && <span className="text-muted-foreground"> — {it.source}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
