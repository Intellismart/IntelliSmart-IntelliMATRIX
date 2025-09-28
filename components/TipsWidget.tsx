import Link from "next/link";
import { getDailyTips } from "@/lib/feeds";

export default async function TipsWidget({ compact = false }: { compact?: boolean }) {
  const tips = getDailyTips();
  return (
    <section className="rounded-xl border p-6 bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Hints & Tips</h2>
        {!compact && <Link href="/tips" className="text-sm underline">More tips</Link>}
      </div>
      <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
