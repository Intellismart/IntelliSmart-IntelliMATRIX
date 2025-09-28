"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserMenu() {
  const [me, setMe] = useState<{ user: { name: string; role: string }; tenant?: { id: string; name: string } } | null>(null);
  useEffect(() => {
    fetch("/api/me").then(async (r) => {
      if (r.ok) setMe(await r.json());
    }).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!me) {
    return (
      <Link href="/login" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Sign in</Link>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-muted-foreground">{me.user.role}{me.tenant ? ` • ${me.tenant.name}` : ""}</span>
      <button onClick={logout} className="px-3 py-1.5 rounded-md border hover:bg-accent hover:text-accent-foreground">Sign out</button>
    </div>
  );
}
