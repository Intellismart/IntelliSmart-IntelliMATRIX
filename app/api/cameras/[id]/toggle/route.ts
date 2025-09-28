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
  const { field = "recording" } = await req.json().catch(() => ({}));
  const db = await readDb();
  const cam = (db.cameras || []).find(c => c.id === params.id && c.tenantId === tenantId);
  if (!cam) return NextResponse.json({ error: "Camera not found" }, { status: 404 });
  await writeDb(d => {
    const c = (d.cameras || []).find(x => x.id === params.id && x.tenantId === tenantId);
    if (c) {
      if (field === "online") (c as any).online = !c.online;
      else (c as any).recording = !c.recording;
      (c as any).lastSeen = new Date().toISOString();
    }
  });
  const db2 = await readDb();
  const updated = (db2.cameras || []).find(c => c.id === params.id && c.tenantId === tenantId)!;
  bus.emit("camera_update", { tenantId, cameraId: params.id, online: field === "online" ? updated.online : undefined, recording: field === "recording" ? updated.recording : undefined });
  return NextResponse.json({ ok: true, camera: updated });
}
