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
  if (!status || !["pending","approved","active","inactive"].includes(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const typedStatus = status as import("@/lib/types").Transport["status"];
  const { id } = await context.params;
  const db = await readDb();
  const t = (db.transports || []).find(x => x.id === id && x.tenantId === tenantId);
  if (!t) return NextResponse.json({ error: "Transport not found" }, { status: 404 });
  await writeDb(d => {
    const item = (d.transports || []).find(x => x.id === id && x.tenantId === tenantId);
    if (item) {
      item.status = typedStatus;
      item.updatedAt = new Date().toISOString();
    }
  });
  bus.emit("transport_update", { tenantId, transportId: id, status: typedStatus });
  return NextResponse.json({ ok: true, status: typedStatus });
}
