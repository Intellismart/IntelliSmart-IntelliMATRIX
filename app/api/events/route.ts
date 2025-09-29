import bus, { EventMap } from "@/lib/events";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    return new Response("Unauthorized", { status: auth.status });
  }
  const tenantId = auth.session.tenantId || auth.user.tenantId || "";

  const encoder = new TextEncoder();
  let hb: ReturnType<typeof setInterval> | null = null;
  let onAgentUpdate: ((payload: EventMap["agent_update"]) => void) | null = null;
  let onSecurityAlert: ((payload: EventMap["security_alert"]) => void) | null = null;
  let onCameraUpdate: ((payload: EventMap["camera_update"]) => void) | null = null;
  let onTransportUpdate: ((payload: EventMap["transport_update"]) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      onAgentUpdate = (payload) => {
        if (payload.tenantId === tenantId) {
          send({ type: "agent_update", payload });
        }
      };
      onSecurityAlert = (payload) => {
        if (payload.tenantId === tenantId) {
          send({ type: "security_alert", payload });
        }
      };
      onCameraUpdate = (payload) => {
        if (payload.tenantId === tenantId) {
          send({ type: "camera_update", payload });
        }
      };
      onTransportUpdate = (payload) => {
        if (payload.tenantId === tenantId) {
          send({ type: "transport_update", payload });
        }
      };
      bus.on("agent_update", onAgentUpdate);
      bus.on("security_alert", onSecurityAlert);
      bus.on("camera_update", onCameraUpdate);
      bus.on("transport_update", onTransportUpdate);

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
      if (onTransportUpdate) bus.off("transport_update", onTransportUpdate);
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
