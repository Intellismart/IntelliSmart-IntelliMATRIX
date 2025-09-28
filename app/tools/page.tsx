import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Online Tools</h1>
      <p className="text-muted-foreground">Quick utilities and demos to help you evaluate and work with our AI agents.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li className="rounded-xl border p-5 bg-card text-card-foreground">
          <div className="font-medium mb-1">Prompt Tester</div>
          <div className="text-sm text-muted-foreground">Experiment with prompts and guardrails (placeholder).</div>
        </li>
        <li className="rounded-xl border p-5 bg-card text-card-foreground">
          <div className="font-medium mb-1">Dataset Uploader</div>
          <div className="text-sm text-muted-foreground">Upload and validate training data (placeholder).</div>
        </li>
        <li className="rounded-xl border p-5 bg-card text-card-foreground">
          <div className="font-medium mb-1">KPI Calculator</div>
          <div className="text-sm text-muted-foreground">Estimate ROI and costs (placeholder).</div>
        </li>
        <li className="rounded-xl border p-5 bg-card text-card-foreground">
          <div className="font-medium mb-1">Vulnerability Scanner</div>
          <div className="text-sm text-muted-foreground">Run a quick posture scan for your tenant (demo stub).</div>
        </li>
        <li className="rounded-xl border p-5 bg-card text-card-foreground">
          <div className="font-medium mb-1">Camera Stream Analyzer</div>
          <div className="text-sm text-muted-foreground">Detect motion anomalies in sample streams (placeholder).</div>
        </li>
      </ul>
      <div>
        <Link href="/store" className="underline">Explore the marketplace</Link>
      </div>
    </div>
  );
}
