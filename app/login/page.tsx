"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="max-w-md mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="text-muted-foreground">Start a 14‑day free trial. No credit card required.</p>
      </header>

      <form className="space-y-3">
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Email" type="email" />
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Password" type="password" />
        {mode === "signup" && (
          <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Company Name" />
        )}
        <Button className="w-full">{mode === "signin" ? "Sign in" : "Create account"}</Button>
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
        <p className="text-sm text-muted-foreground mb-3">Try the portal and explore the marketplace while on trial.</p>
        <div className="flex gap-2">
          <Link href="/portal"><Button size="sm">Start Free Trial</Button></Link>
          <Link href="/store"><Button size="sm" variant="outline">Explore Marketplace</Button></Link>
        </div>
      </div>
    </div>
  );
}
