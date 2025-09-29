import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb, genId } from "@/lib/store";
import { Role, User } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  // Admin sees all, reseller sees their managed tenants' users, others see their tenant users
  let users = db.users;
  if (auth.user.role === "reseller") {
    const ids = new Set(auth.user.managedTenantIds || []);
    users = users.filter(u => (u.tenantId && ids.has(u.tenantId)) || u.role === "reseller");
  } else if (auth.user.role !== "admin") {
    users = users.filter(u => u.tenantId === auth.user.tenantId);
  }
  // Do not expose passwords
  const safe = users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenantId }));
  return NextResponse.json({ users: safe });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const { email, name, role, tenantId } = body as { email?: string; name?: string; role?: Role; tenantId?: string };
  if (!email || !name || !role) return NextResponse.json({ error: "email, name, role required" }, { status: 400 });
  if (auth.user.role === "admin") {
    // allow any tenant
  } else if (auth.user.role === "reseller") {
    if (!tenantId || !auth.user.managedTenantIds?.includes(tenantId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    if (tenantId && tenantId !== auth.user.tenantId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const newUser: User = { id: genId("user"), email: email!, name: name!, role: role!, tenantId, password: "demo" };
  await writeDb(db => { db.users.push(newUser); });
  return NextResponse.json({ user: { id: newUser.id, email, name, role, tenantId } });
}
