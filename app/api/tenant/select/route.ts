import { NextResponse } from "next/server";
import { requireAuth, createSession } from "@/lib/auth";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { tenantId } = await req.json().catch(() => ({}));
  if (!tenantId) return NextResponse.json({ error: "tenantId required" }, { status: 400 });

  const db = await readDb();
  const tenant = db.tenants.find(t => t.id === tenantId);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Authorization: 
  if (auth.user.role === "reseller") {
    const allowed = auth.user.managedTenantIds?.includes(tenantId);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (auth.user.role === "admin") {
    // allowed to select any tenant
  } else {
    if (auth.user.tenantId !== tenantId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await createSession(auth.user.id, auth.user.role, tenantId);
  return NextResponse.json({ ok: true, tenant });
}
