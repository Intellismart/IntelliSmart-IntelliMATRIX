import { EventEmitter } from "events";

export type EventMap = {
  agent_update: { tenantId: string; agentId: string; status: "running" | "stopped" };
  security_alert: { tenantId: string; alertId: string; severity: "low" | "medium" | "high" | "critical"; status: "open" | "ack" | "resolved" };
  camera_update: { tenantId: string; cameraId: string; online?: boolean; recording?: boolean };
  transport_update: { tenantId: string; transportId: string; status: "pending" | "approved" | "active" | "inactive" };
};

type EventKey = keyof EventMap;

class TenantEmitter {
  private emitter = new EventEmitter();
  private registry = new Map<EventKey, WeakMap<Function, (...args: unknown[]) => void>>();
  on<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void) {
    let wm = this.registry.get(event);
    if (!wm) {
      wm = new WeakMap();
      this.registry.set(event, wm);
    }
    const wrapped = (payload: unknown) => listener(payload as EventMap[K]);
    wm.set(listener, wrapped);
    this.emitter.on(event, wrapped);
  }
  off<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void) {
    const wm = this.registry.get(event);
    const wrapped = wm?.get(listener);
    if (wrapped) {
      this.emitter.off(event, wrapped);
      wm!.delete(listener);
    }
  }
  emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    this.emitter.emit(event, payload);
  }
}

// singleton
const bus = new TenantEmitter();
export default bus;
