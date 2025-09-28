import { EventEmitter } from "events";

type EventMap = {
  agent_update: { tenantId: string; agentId: string; status: "running" | "stopped" };
  security_alert: { tenantId: string; alertId: string; severity: "low" | "medium" | "high" | "critical"; status: "open" | "ack" | "resolved" };
  camera_update: { tenantId: string; cameraId: string; online?: boolean; recording?: boolean };
};

type EventKey = keyof EventMap;

class TenantEmitter {
  private emitter = new EventEmitter();
  on<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void) {
    this.emitter.on(event, listener as any);
  }
  off<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void) {
    this.emitter.off(event, listener as any);
  }
  emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    this.emitter.emit(event, payload);
  }
}

// singleton
const bus = new TenantEmitter();
export default bus;
