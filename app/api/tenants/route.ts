import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import { Tenant } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  let tenants: Tenant[] = [];
  if (auth.user.role === "admin") tenants = db.tenants;
  else if (auth.user.role === "reseller") tenants = db.tenants.filter(t => auth.user.managedTenantIds?.includes(t.id));
  else if (auth.user.tenantId) tenants = db.tenants.filter(t => t.id === auth.user.tenantId);
  return NextResponse.json({ tenants });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!(auth.user.role === "admin" || auth.user.role === "reseller")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const name: string | undefined = body?.name;
  const id: string | undefined = body?.id || undefined;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const slug = (id || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await writeDb(db => {
    if (db.tenants.find(t => t.id === slug)) throw new Error("Tenant exists");
    const tenant: Tenant = { id: slug, name, createdAt: new Date().toISOString(), ownerUserId: auth.user.id };
    db.tenants.push(tenant);
  });
  const db2 = await readDb();
  const tenant = db2.tenants.find(t => t.id === slug)!;
  return NextResponse.json({ tenant });
}
