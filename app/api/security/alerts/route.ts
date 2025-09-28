import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb, genId } from "@/lib/store";
import bus from "@/lib/events";
import type { SecurityAlert } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const db = await readDb();
  const alerts = (db.securityAlerts || []).filter(a => a.tenantId === tenantId).sort((a,b)=> (a.time < b.time ? 1 : -1));
  return NextResponse.json({ alerts });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const { title, severity = "medium", source = "network", description } = body as Partial<SecurityAlert> & { title?: string };
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const id = genId("sec");
  const time = new Date().toISOString();
  const alert: SecurityAlert = { id, tenantId, title, severity: (severity as any) || "medium", source: (source as any) || "network", description, time, status: "open" };
  await writeDb(db => {
    if (!db.securityAlerts) (db as any).securityAlerts = [];
    db.securityAlerts.push(alert);
  });
  bus.emit("security_alert", { tenantId, alertId: id, severity: alert.severity, status: alert.status });
  return NextResponse.json({ alert });
}
