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
  const { field = "recording" } = await req.json().catch(() => ({}));
  const { id } = await context.params;
  const db = await readDb();
  const cam = (db.cameras || []).find(c => c.id === id && c.tenantId === tenantId);
  if (!cam) return NextResponse.json({ error: "Camera not found" }, { status: 404 });
  await writeDb(d => {
    const c = (d.cameras || []).find(x => x.id === id && x.tenantId === tenantId);
    if (c) {
      if (field === "online") c.online = !c.online;
      else c.recording = !c.recording;
      c.lastSeen = new Date().toISOString();
    }
  });
  const db2 = await readDb();
  const updated = (db2.cameras || []).find(c => c.id === id && c.tenantId === tenantId)!;
  bus.emit("camera_update", { tenantId, cameraId: id, online: field === "online" ? updated.online : undefined, recording: field === "recording" ? updated.recording : undefined });
  return NextResponse.json({ ok: true, camera: updated });
}
