import { fetchReviewsFeeds } from "@/lib/feeds";

export default async function ReviewsWidget() {
  const items = await fetchReviewsFeeds();
  return (
    <section className="rounded-xl border p-6 bg-card text-card-foreground">
      <h2 className="font-semibold mb-3">Latest Reviews</h2>
      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="leading-snug">
            <a href={it.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {truncate(it.title, 110)}
            </a>
            {it.source && <span className="text-muted-foreground"> — {it.source}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
