import { getDailyTips } from "@/lib/feeds";

export const metadata = {
  title: "Hints & Tips • IntelliSMART AI Factory",
  description: "Daily rotating tips for AI, robotics, drones, and smart home deployments.",
};

export default function TipsPage() {
  const tips = getDailyTips();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Hints & Tips</h1>
        <p className="text-muted-foreground">Curated best practices that rotate daily.</p>
      </header>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
