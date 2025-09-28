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
  let hb: any;
  let onAgentUpdate: any;
  let onSecurityAlert: any;
  let onCameraUpdate: any;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      onAgentUpdate = (payload: any) => {
        if (payload.tenantId === tenantId) {
          send({ type: "agent_update", payload });
        }
      };
      onSecurityAlert = (payload: any) => {
        if (payload.tenantId === tenantId) {
          send({ type: "security_alert", payload });
        }
      };
      onCameraUpdate = (payload: any) => {
        if (payload.tenantId === tenantId) {
          send({ type: "camera_update", payload });
        }
      };
      bus.on("agent_update", onAgentUpdate);
      bus.on("security_alert", onSecurityAlert);
      bus.on("camera_update", onCameraUpdate);

      // heartbeat
      hb = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 25000);

      // initial event to confirm connected
      send({ type: "connected" });
    },
    cancel() {
      if (hb) clearInterval(hb);
      if (onAgentUpdate) bus.off("agent_update", onAgentUpdate);
      if (onSecurityAlert) bus.off("security_alert", onSecurityAlert);
      if (onCameraUpdate) bus.off("camera_update", onCameraUpdate);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
