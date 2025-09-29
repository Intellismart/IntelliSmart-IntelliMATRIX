import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth({ minRole: "admin" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  const settings: SiteSettings = ((db as any).cms?.settings || { siteTitle: "Site" }) as SiteSettings;
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const auth = await requireAuth({ minRole: "admin" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const siteTitle = typeof body?.siteTitle === "string" ? body.siteTitle.slice(0, 100) : undefined;
  const homePageSlug = typeof body?.homePageSlug === "string" ? body.homePageSlug.slice(0, 200) : undefined;
  await writeDb(db => {
    const cms = ((db as any).cms = (db as any).cms || { pages: [], menu: [], settings: { siteTitle: "Site" } });
    cms.settings = {
      siteTitle: siteTitle ?? cms.settings.siteTitle ?? "Site",
      homePageSlug: homePageSlug ?? cms.settings.homePageSlug,
    };
  });
  const db2 = await readDb();
  const settings: SiteSettings = ((db2 as any).cms?.settings || { siteTitle: "Site" }) as SiteSettings;
  return NextResponse.json({ settings });
}
