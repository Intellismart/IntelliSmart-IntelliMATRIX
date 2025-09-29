import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import bus from "@/lib/events";

export const dynamic = "force-dynamic";


export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const body = await req.json().catch(() => ({} as { status?: string }));
  const status = body.status;
  if (!status || !["open","ack","resolved"].includes(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const typedStatus = status as import("@/lib/types").SecurityAlert["status"];
  const { id } = await context.params;
  const db = await readDb();
  const alert = (db.securityAlerts || []).find(a => a.id === id && a.tenantId === tenantId);
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  await writeDb(d => {
    const a = (d.securityAlerts || []).find(x => x.id === id && x.tenantId === tenantId);
    if (a) a.status = typedStatus;
  });
  bus.emit("security_alert", { tenantId, alertId: id, severity: alert.severity, status: typedStatus });
  return NextResponse.json({ ok: true, status: typedStatus });
}
