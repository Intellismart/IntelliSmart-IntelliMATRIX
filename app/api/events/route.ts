import bus from "@/lib/events";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    return new Response("Unauthorized", { status: auth.status });
  }
  const tenantId = auth.session.tenantId || auth.user.tenantId || "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const onAgentUpdate = (payload: any) => {
        if (payload.tenantId === tenantId) {
          send({ type: "agent_update", payload });
        }
      };
      bus.on("agent_update", onAgentUpdate);

      // heartbeat
      const hb = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 25000);

      // initial event to confirm connected
      send({ type: "connected" });

      return () => {
        clearInterval(hb);
        bus.off("agent_update", onAgentUpdate);
      };
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
