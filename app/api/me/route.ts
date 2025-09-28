import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  const tenant = auth.session.tenantId ? db.tenants.find(t => t.id === auth.session.tenantId) : undefined;
  return NextResponse.json({ user: { id: auth.user.id, email: auth.user.email, name: auth.user.name, role: auth.user.role }, tenant: tenant || null, session: auth.session });
}
