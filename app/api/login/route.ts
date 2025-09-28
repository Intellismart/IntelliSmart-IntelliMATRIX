import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password, tenantId } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const db = await readDb();
  const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // Determine active tenant
  let activeTenantId: string | undefined = user.tenantId;
  if (!activeTenantId && user.managedTenantIds?.length) {
    if (tenantId && user.managedTenantIds.includes(tenantId)) activeTenantId = tenantId;
    else activeTenantId = user.managedTenantIds[0];
  }
  await createSession(user.id, user.role, activeTenantId);
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, tenantId: activeTenantId });
}
