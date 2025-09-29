"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Agent = {
  id: string;
  name: string;
  status: "running" | "stopped";
};

type SecurityAlert = { id: string; title: string; severity: "low" | "medium" | "high" | "critical"; status: "open" | "ack" | "resolved"; time: string; source: string };
type Camera = { id: string; name: string; online: boolean; recording: boolean; location?: string; lastSeen: string };

type Transport = { id: string; vehicleId: string; kind: "shuttle" | "rover" | "robotaxi" | "delivery"; status: "pending" | "approved" | "active" | "inactive"; location?: string; updatedAt: string };

type Audience = "consumer" | "business" | "reseller";
 type RoleLocal = Audience | "admin";

export default function PortalPage() {
  const search = useSearchParams();
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>((search.get("mode") as Audience) || "business");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [uploadNote, setUploadNote] = useState<string>("");
  const [plan, setPlan] = useState<{ name: string; trialDaysLeft: number | null }>({ name: "Pro (Trial)", trialDaysLeft: 14 });
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [me, setMe] = useState<{ user: { role: RoleLocal }; tenant?: { id: string; name: string } } | null>(null);

  // keep URL in sync
  useEffect(() => {
    const sp = new URLSearchParams(search.toString());
    sp.set("mode", audience);
    router.replace(`/portal?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience]);

  // load session and default audience from role
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me");
      if (res.ok) {
        const j = await res.json();
        setMe(j);
        setAudience((search.get("mode") as Audience) || j.user.role || "business");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load agents
  async function loadAgents() {
    const res = await fetch("/api/agents");
    if (res.ok) {
      const j = await res.json();
      setAgents(j.agents || []);
    }
  }
  async function loadAlerts() {
    const res = await fetch("/api/security/alerts");
    if (res.ok) {
      const j = await res.json();
      setAlerts(j.alerts || []);
    }
  }
  async function loadCameras() {
    const res = await fetch("/api/cameras");
    if (res.ok) {
      const j = await res.json();
      setCameras(j.cameras || []);
    }
  }
  async function loadTransports() {
    const res = await fetch("/api/transports");
    if (res.ok) {
      const j = await res.json();
      setTransports(j.transports || []);
    }
  }

  useEffect(() => { loadAgents(); loadAlerts(); loadCameras(); loadTransports(); }, []);

  // SSE for realtime updates
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === "agent_update") {
          const { agentId, status } = data.payload;
          setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status } : a));
        } else if (data?.type === "security_alert") {
          // Refresh alerts list on any security alert event
          loadAlerts();
        } else if (data?.type === "camera_update") {
          const { cameraId, online, recording } = data.payload;
          setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, online: online ?? c.online, recording: recording ?? c.recording, lastSeen: new Date().toISOString() } : c));
        } else if (data?.type === "transport_update") {
          const { transportId, status } = data.payload;
          setTransports(prev => prev.map(t => t.id === transportId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
        }
      } catch {}
    };
    return () => { es.close(); };
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Active Agents", value: agents.filter(a => a.status === "running").length },
      { label: audience === "consumer" ? "Devices" : "Messages (30d)", value: audience === "consumer" ? 12 : 12450 },
      { label: audience === "consumer" ? "Energy Saved" : "Avg. Latency", value: audience === "consumer" ? "8%" : "1.2s" },
      { label: audience === "reseller" ? "Clients" : "Est. Cost (MTD)", value: audience === "reseller" ? 14 : "$238.40" },
    ],
    [agents, audience]
  );

  async function toggleAgent(id: string) {
    await fetch(`/api/agents/${id}/toggle`, { method: "POST" });
    // optimistic update is handled by SSE too
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "running" ? "stopped" : "running" } : a));
  }

  async function runSecurityScan(scope?: string) {
    await fetch('/api/security/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope }) });
    await loadAlerts();
  }

  async function setAlertStatus(id: string, status: 'open' | 'ack' | 'resolved') {
    await fetch(`/api/security/alerts/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    await loadAlerts();
  }

  async function addCamera(name?: string) {
    await fetch('/api/cameras', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    await loadCameras();
  }

  async function toggleCamera(id: string, field: 'recording' | 'online' = 'recording') {
    const res = await fetch(`/api/cameras/${id}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field }) });
    if (res.ok) {
      await loadCameras();
    }
  }

  async function addTransport(kind: Transport["kind"] = "delivery") {
    await fetch('/api/transports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
    await loadTransports();
  }

  async function setTransportStatus(id: string, status: Transport["status"]) {
    await fetch(`/api/transports/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    await loadTransports();
  }

  function handleTrainingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadNote("Training data received. Indexing & fine-tune job queued (demo stub).");
  }

  async function switchTenant(tid: string) {
    await fetch('/api/tenant/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId: tid }) });
    await loadAgents();
  }

  useEffect(() => {
    if (me?.user.role === 'reseller' || me?.user.role === 'admin') {
      fetch('/api/tenants').then(r => r.json()).then(j => setTenants(j.tenants || [])).catch(()=>{});
    }
  }, [me]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <p className="text-muted-foreground">Monitor KPIs, manage agents, feed training data, and control access.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/store"><Button variant="outline">Marketplace</Button></Link>
          {(me?.user.role === 'admin' || me?.user.role === 'reseller') && (
            <Link href="/admin"><Button variant="outline">Admin</Button></Link>
          )}
        </div>
      </header>

      {/* Audience toggle */}
      <section className="rounded-xl border p-2 bg-card text-card-foreground">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <ToggleBtn label="Business" active={audience === "business"} onClick={() => setAudience("business")} />
            <ToggleBtn label="Consumer" active={audience === "consumer"} onClick={() => setAudience("consumer")} />
            <ToggleBtn label="Reseller" active={audience === "reseller"} onClick={() => setAudience("reseller")} />
          </div>
          {(me?.user.role === 'reseller' || me?.user.role === 'admin') && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Tenant:</span>
              <select className="rounded-md border bg-background px-2 py-1" onChange={(e)=>switchTenant(e.target.value)} value={me?.tenant?.id || ''}>
                {(me?.tenant?.id && !tenants.find(t=>t.id===me.tenant!.id)) && (
                  <option value={me.tenant!.id}>{me.tenant!.name}</option>
                )}
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {audience === "business" && "Business: multi-user, billing, SLAs, and fleet controls."}
          {audience === "consumer" && "Consumer: simple device setup, automation scenes, and energy insights."}
          {audience === "reseller" && "Reseller: client workspaces, margins, and provisioning shortcuts."}
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border p-5 bg-card text-card-foreground">
              <div className="text-sm text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-semibold mt-1">{k.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Domain controls */}
      <section className="grid gap-6 lg:grid-cols-2">
        <DomainCard title="IoT Devices" subtitle={audience === "consumer" ? "Home sensors & hubs" : audience === "reseller" ? "Client device fleets" : "Factory/office sensors"}>
          <div className="flex gap-2">
            <Button size="sm">Scan & Onboard</Button>
            <Button size="sm" variant="outline">Policies</Button>
          </div>
        </DomainCard>
        <DomainCard title="Robots" subtitle={audience === "consumer" ? "Companion & edu-bots" : audience === "reseller" ? "Client robots" : "Service & warehouse"}>
          <div className="flex gap-2">
            <Button size="sm">Routines</Button>
            <Button size="sm" variant="outline">Safety</Button>
          </div>
        </DomainCard>
        <DomainCard title="Autonomous Drones" subtitle={audience === "consumer" ? "Flight scenes" : audience === "reseller" ? "Client fleets" : "Missions & compliance"}>
          <div className="flex gap-2">
            <Button size="sm">Plan Mission</Button>
            <Button size="sm" variant="outline">No‑fly Zones</Button>
          </div>
        </DomainCard>
        <DomainCard title="Smart Home" subtitle={audience === "consumer" ? "Scenes & automations" : audience === "reseller" ? "Deploy bundles" : "Buildings & BMS"}>
          <div className="flex gap-2">
            <Button size="sm">New Scene</Button>
            <Button size="sm" variant="outline">Energy</Button>
          </div>
        </DomainCard>
        <DomainCard title="Cybersecurity" subtitle={audience === "consumer" ? "Home network & devices" : audience === "reseller" ? "Client posture" : "Zero‑trust posture"}>
          <div className="flex gap-2 mb-3">
            <Button size="sm" onClick={() => runSecurityScan('network')}>Run Scan</Button>
            <Button size="sm" variant="outline" onClick={() => runSecurityScan('camera')}>Scan Cameras</Button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0,5).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border p-2">
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.severity.toUpperCase()} · {new Date(a.time).toLocaleString()} · {a.source}</div>
                </div>
                <div className="flex gap-2">
                  {a.status !== 'ack' && <Button size="sm" variant="outline" onClick={() => setAlertStatus(a.id,'ack')}>Ack</Button>}
                  {a.status !== 'resolved' && <Button size="sm" onClick={() => setAlertStatus(a.id,'resolved')}>Resolve</Button>}
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-xs text-muted-foreground">No alerts.</div>}
          </div>
        </DomainCard>
        <DomainCard title="Camera Security" subtitle={audience === "consumer" ? "Home cameras" : audience === "reseller" ? "Client CCTV" : "Cameras & NVRs"}>
          <div className="flex gap-2 mb-3">
            <Button size="sm" onClick={() => addCamera()}>Add Camera</Button>
            <Button size="sm" variant="outline">View Streams</Button>
          </div>
          <div className="space-y-2">
            {cameras.slice(0,5).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border p-2">
                <div>
                  <div className="text-sm font-medium">{c.name} <span className="text-xs text-muted-foreground">({c.location || 'Unknown'})</span></div>
                  <div className="text-xs text-muted-foreground">Online: {String(c.online)} · Recording: {String(c.recording)}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleCamera(c.id,'online')}>{c.online ? 'Go Offline' : 'Go Online'}</Button>
                  <Button size="sm" onClick={() => toggleCamera(c.id,'recording')}>{c.recording ? 'Stop Rec' : 'Start Rec'}</Button>
                </div>
              </div>
            ))}
            {cameras.length === 0 && <div className="text-xs text-muted-foreground">No cameras.</div>}
          </div>
        </DomainCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Agents</h2>
            <Link href="/store"><Button size="sm">Add Agent</Button></Link>
          </div>
          <div className="space-y-3">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">Status: {a.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleAgent(a.id)}>
                    {a.status === "running" ? "Stop" : "Start"}
                  </Button>
                  <Button size="sm" variant="ghost">Logs</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-2">Training Data</h2>
          <p className="text-sm text-muted-foreground mb-4">Upload private {audience === "consumer" ? "home" : audience === "reseller" ? "client" : "business"} data to improve your agents. Data is isolated per-tenant (zero-trust model placeholder).</p>
          <form onSubmit={handleTrainingSubmit} className="space-y-3">
            <input type="file" className="block w-full text-sm" multiple />
            <textarea className="w-full rounded-md border bg-background p-2 text-sm" rows={4} placeholder="Paste guidelines, SOPs, FAQs, product sheets..." />
            <div className="flex gap-2">
              <Button type="submit">Upload & Queue Training</Button>
              <Button type="button" variant="outline">Manage Datasets</Button>
            </div>
          </form>
          {uploadNote && <div className="mt-3 text-xs text-muted-foreground">{uploadNote}</div>}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-2">Subscription</h2>
          <div className="text-sm">Plan: <span className="font-medium">{plan.name}</span></div>
          <div className="text-sm text-muted-foreground">{plan.trialDaysLeft ? `${plan.trialDaysLeft} days left in trial` : "Active subscription"}</div>
          <div className="mt-3 flex gap-2">
            <Button size="sm">Manage Billing</Button>
            <Button size="sm" variant="outline" onClick={() => setPlan({ name: "Pro", trialDaysLeft: null })}>Upgrade</Button>
          </div>
        </div>

        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-2">Account Details</h2>
          <form className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border bg-background p-2 text-sm" placeholder={audience === 'consumer' ? 'Full Name' : 'Company Name'} defaultValue={audience === 'consumer' ? 'Alex Johnson' : 'Acme Co.'} />
              <input className="rounded-md border bg-background p-2 text-sm" placeholder="Email" defaultValue="ops@acme.co" />
            </div>
            <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Billing Address" defaultValue="123 Main St, Springfield" />
            <div className="flex gap-2">
              <Button size="sm">Save</Button>
              <Button size="sm" variant="outline">Security</Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border p-6 bg-card text-card-foreground">
          <h2 className="font-semibold mb-2">AI News & Updates</h2>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            <li>New: Multi-channel agent orchestration beta</li>
            <li>Security: Tenant-scoped secrets vault rolling out</li>
            <li>Marketplace: 5 new sector packs for retail and logistics</li>
          </ul>
          <Link href="/news" className="inline-block mt-3 text-sm underline">Read industry news</Link>
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Transports</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addTransport('delivery')}>Add Delivery Vehicle</Button>
            <Button size="sm" variant="outline" onClick={() => loadTransports()}>Refresh</Button>
          </div>
        </div>
        <div className="space-y-3">
          {transports.slice(0,5).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{t.vehicleId || t.id} <span className="text-xs text-muted-foreground">({t.kind})</span></div>
                <div className="text-xs text-muted-foreground">Status: {t.status} · {t.location || '—'}</div>
              </div>
              <div className="flex gap-2">
                {t.status !== 'approved' && <Button size="sm" variant="outline" onClick={() => setTransportStatus(t.id, 'approved')}>Approve</Button>}
                {t.status !== 'active' && <Button size="sm" onClick={() => setTransportStatus(t.id, 'active')}>Activate</Button>}
                {t.status === 'active' && <Button size="sm" variant="destructive" onClick={() => setTransportStatus(t.id, 'inactive')}>Deactivate</Button>}
              </div>
            </div>
          ))}
          {transports.length === 0 && <div className="text-xs text-muted-foreground">No transports yet.</div>}
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-card text-card-foreground">
        <h2 className="font-semibold mb-2">Monitoring & Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Event</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { t: "2025-09-27 19:55", a: "Support Agent", e: "Handled ticket #8421", s: "OK" },
                { t: "2025-09-27 19:50", a: "Sales SDR", e: "Cadence resumed", s: "OK" },
                { t: "2025-09-27 19:41", a: "Ops Automation", e: "Reconciliation run", s: "OK" },
              ].map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap">{row.t}</td>
                  <td className="py-2 pr-4">{row.a}</td>
                  <td className="py-2 pr-4">{row.e}</td>
                  <td className="py-2">{row.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-sm text-muted-foreground">
        Need help? Contact support at <a className="underline" href="mailto:support@example.com">support@example.com</a>.
      </footer>
    </div>
  );
}

function ToggleBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-md border text-sm ${active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      {label}
    </button>
  );
}

function DomainCard({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-6 bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <span className="text-xs rounded-full border px-2 py-0.5">Connected</span>
      </div>
      {children}
    </div>
  );
}
