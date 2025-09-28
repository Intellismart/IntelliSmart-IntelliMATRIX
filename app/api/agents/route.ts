import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb, genId } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const db = await readDb();
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const agents = db.agents.filter(a => a.tenantId === tenantId);
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const name: string | undefined = body?.name;
  const status: "running" | "stopped" = body?.status === "stopped" ? "stopped" : "running";
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  await writeDb(db => {
    db.agents.push({ id: genId("agent"), tenantId, name, status });
  });
  const db = await readDb();
  const agents = db.agents.filter(a => a.tenantId === tenantId);
  return NextResponse.json({ agents });
}
