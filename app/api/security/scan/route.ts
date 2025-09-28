import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeDb, genId } from "@/lib/store";
import bus from "@/lib/events";
import type { SecurityAlert } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const { scope = "network" } = await req.json().catch(() => ({}));
  // Simulate scan finding an issue 50% of the time
  const found = Math.random() > 0.5;
  let alert: SecurityAlert | null = null;
  if (found) {
    const id = genId("sec");
    const time = new Date().toISOString();
    alert = {
      id,
      tenantId,
      severity: scope === "camera" ? "high" : "medium",
      source: scope as any,
      title: scope === "camera" ? "Camera motion anomaly" : "Vulnerability detected",
      description: scope === "camera" ? "Unexpected motion pattern detected during quiet hours." : "Open port with default credentials",
      time,
      status: "open",
    };
    await writeDb(db => {
      if (!db.securityAlerts) (db as any).securityAlerts = [];
      db.securityAlerts.push(alert!);
    });
    bus.emit("security_alert", { tenantId, alertId: alert.id, severity: alert.severity, status: alert.status });
  }
  return NextResponse.json({ ok: true, found, alert });
}
