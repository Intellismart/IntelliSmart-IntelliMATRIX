import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb, genId } from "@/lib/store";
import type { Camera } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const db = await readDb();
  const cameras = (db.cameras || []).filter(c => c.tenantId === tenantId);
  return NextResponse.json({ cameras });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const { name = "New Camera", location } = body as Partial<Camera>;
  const now = new Date().toISOString();
  const cam: Camera = { id: genId("cam"), tenantId, name, location, online: true, recording: false, lastSeen: now };
  await writeDb(db => {
    db.cameras.push(cam);
  });
  const db2 = await readDb();
  const cameras = (db2.cameras || []).filter(c => c.tenantId === tenantId);
  return NextResponse.json({ cameras });
}
