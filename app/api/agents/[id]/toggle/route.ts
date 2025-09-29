import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/store";
import bus from "@/lib/events";

export const dynamic = "force-dynamic";


export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const tenantId = auth.session.tenantId || auth.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant selected" }, { status: 400 });
  const { id } = await context.params;
  const db = await readDb();
  const agent = db.agents.find(a => a.id === id && a.tenantId === tenantId);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const newStatus = agent.status === "running" ? "stopped" : "running";
  await writeDb(d => {
    const a = d.agents.find(x => x.id === id && x.tenantId === tenantId);
    if (a) a.status = newStatus;
  });

  bus.emit("agent_update", { tenantId, agentId: id, status: newStatus });

  return NextResponse.json({ ok: true, status: newStatus });
}
