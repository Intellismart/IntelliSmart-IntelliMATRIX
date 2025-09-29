import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb, genId } from "@/lib/store";
import type { Transport } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const db = await readDb();
  const transports = (db.transports || []).filter(t => t.tenantId === tenantId);
  return NextResponse.json({ transports });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const { vehicleId = `VEH-${Math.random().toString(36).slice(2,8).toUpperCase()}`, kind = "shuttle", location } = body as Partial<Transport>;
  const now = new Date().toISOString();
  const allowedKinds: Transport["kind"][] = ["shuttle", "rover", "robotaxi", "delivery"];
  const kindVal: Transport["kind"] = allowedKinds.includes(kind as Transport["kind"]) ? (kind as Transport["kind"]) : "shuttle";
  const t: Transport = { id: genId("trans"), tenantId, vehicleId, kind: kindVal, status: "pending", location, updatedAt: now };
  await writeDb(db => {
    db.transports.push(t);
  });
  const db2 = await readDb();
  const transports = (db2.transports || []).filter(x => x.tenantId === tenantId);
  return NextResponse.json({ transports, transport: t });
}
