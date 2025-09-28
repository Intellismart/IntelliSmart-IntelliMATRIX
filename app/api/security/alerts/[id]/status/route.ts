import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import bus from "@/lib/events";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const { status } = await req.json().catch(() => ({}));
  if (!status || !["open","ack","resolved"].includes(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const db = await readDb();
  const alert = (db.securityAlerts || []).find(a => a.id === params.id && a.tenantId === tenantId);
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  await writeDb(d => {
    const a = (d.securityAlerts || []).find(x => x.id === params.id && x.tenantId === tenantId);
    if (a) (a as any).status = status;
  });
  bus.emit("security_alert", { tenantId, alertId: params.id, severity: alert.severity, status });
  return NextResponse.json({ ok: true, status });
}
