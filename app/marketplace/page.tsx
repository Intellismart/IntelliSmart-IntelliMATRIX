import Link from "next/link";

export default function MarketplacePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <p className="text-muted-foreground">Browse, purchase, and deploy AI Agents. For now, visit our main store page.</p>
      <Link href="/store" className="underline">Go to Online Store</Link>
    </div>
  );
}
