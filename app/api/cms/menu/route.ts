import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth({ minRole: "admin" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  const menu: MenuItem[] = ((db as any).cms?.menu || []) as MenuItem[];
  return NextResponse.json({ menu });
}

export async function POST(req: Request) {
  const auth = await requireAuth({ minRole: "admin" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const menu = Array.isArray(body?.menu) ? (body.menu as MenuItem[]) : null;
  if (!menu) return NextResponse.json({ error: "menu array required" }, { status: 400 });
  const sanitized = menu
    .filter(Boolean)
    .map(it => ({ label: String((it as any).label || "").slice(0, 100), href: String((it as any).href || "").slice(0, 200) }))
    .filter(it => it.label && it.href);
  await writeDb(db => {
    const cms = ((db as any).cms = (db as any).cms || { pages: [], menu: [], settings: { siteTitle: "Site" } });
    cms.menu = sanitized;
  });
  return NextResponse.json({ menu: sanitized });
}
