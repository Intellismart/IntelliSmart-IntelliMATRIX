"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Login failed");
      }
      const data = await res.json();
      const next = search.get("next");
      if (data?.user?.role === "admin") router.push("/admin");
      else router.push(next || "/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(role: "admin" | "reseller" | "business" | "consumer") {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: "admin@acme.co", password: "admin" },
      reseller: { email: "reseller@example.com", password: "demo" },
      business: { email: "ops@acme.co", password: "demo" },
      consumer: { email: "consumer@example.com", password: "demo" },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
    // Auto submit
    await handleSubmit(new Event("submit") as any);
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="text-muted-foreground">Start a 14‑day free trial. No credit card required.</p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {mode === "signup" && (
          <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Company Name" />
        )}
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : mode === "signin" ? "Sign in" : "Create account"}</Button>
      </form>

      <div className="text-sm text-muted-foreground">
        {mode === "signin" ? (
          <span>
            New here? <button className="underline" onClick={() => setMode("signup")}>Create an account</button>
          </span>
        ) : (
          <span>
            Have an account? <button className="underline" onClick={() => setMode("signin")}>Sign in</button>
          </span>
        )}
      </div>

      <div className="rounded-xl border p-4 bg-card text-card-foreground">
        <div className="font-medium mb-1">Or jump right in</div>
        <p className="text-sm text-muted-foreground mb-3">Use demo accounts:</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => quickLogin("admin")}>Admin</Button>
          <Button size="sm" variant="outline" onClick={() => quickLogin("reseller")}>Reseller</Button>
          <Button size="sm" variant="outline" onClick={() => quickLogin("business")}>Business</Button>
          <Button size="sm" variant="outline" onClick={() => quickLogin("consumer")}>Consumer</Button>
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-card text-card-foreground">
        <div className="font-medium mb-1">Or jump right in</div>
        <p className="text-sm text-muted-foreground mb-3">Try the portal and explore the marketplace while on trial.</p>
        <div className="flex gap-2">
          <Link href="/portal"><Button size="sm">Start Free Trial</Button></Link>
          <Link href="/store"><Button size="sm" variant="outline">Explore Marketplace</Button></Link>
        </div>
      </div>
    </div>
  );
}
