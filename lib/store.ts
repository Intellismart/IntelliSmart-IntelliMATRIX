import { promises as fs } from "fs";
import path from "path";
import { Agent, DbSchema, Tenant, User, SecurityAlert, Camera } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "db.json");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function loadDb(): Promise<DbSchema> {
  await ensureDir();
  try {
    const raw = await fs.readFile(dbFile, "utf-8");
    const db = JSON.parse(raw) as any;
    let migrated = false;
    if (!db.securityAlerts) { db.securityAlerts = []; migrated = true; }
    if (!db.cameras) { db.cameras = []; migrated = true; }
    if (migrated) {
      await fs.writeFile(dbFile, JSON.stringify(db, null, 2), "utf-8");
    }
    return db as DbSchema;
  } catch (e: any) {
    if (e.code === "ENOENT") {
      const seeded = seed();
      await fs.writeFile(dbFile, JSON.stringify(seeded, null, 2), "utf-8");
      return seeded;
    }
    throw e;
  }
}

async function saveDb(db: DbSchema) {
  await ensureDir();
  const tmp = dbFile + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tmp, dbFile);
}

function seed(): DbSchema {
  const now = new Date().toISOString();
  const tenants: Tenant[] = [
    { id: "acme", name: "Acme Corporation", createdAt: now },
    { id: "home-123", name: "Home 123", createdAt: now },
    { id: "client-1", name: "Client One", createdAt: now },
  ];
  const users: User[] = [
    { id: "u-admin", email: "admin@acme.co", name: "Admin", role: "admin", tenantId: "acme", password: "admin" },
    { id: "u-biz", email: "ops@acme.co", name: "Ops Manager", role: "business", tenantId: "acme", password: "demo" },
    { id: "u-consumer", email: "consumer@example.com", name: "Alex Johnson", role: "consumer", tenantId: "home-123", password: "demo" },
    { id: "u-reseller", email: "reseller@example.com", name: "Reseller Rep", role: "reseller", managedTenantIds: ["client-1", "acme"], password: "demo" },
  ];
  const agents: Agent[] = [
    { id: "a1", tenantId: "acme", name: "Support Agent", status: "running" },
    { id: "a2", tenantId: "acme", name: "Sales SDR", status: "stopped" },
    { id: "a3", tenantId: "acme", name: "Ops Automation", status: "running" },
    { id: "a4", tenantId: "home-123", name: "Home Helper", status: "running" },
    { id: "a5", tenantId: "client-1", name: "Retail Assistant", status: "stopped" },
  ];
  const cameras: Camera[] = [
    { id: "cam1", tenantId: "acme", name: "Front Entrance", location: "HQ - Lobby", online: true, recording: true, lastSeen: now },
    { id: "cam2", tenantId: "acme", name: "Warehouse Aisle 3", location: "DC-1", online: true, recording: false, lastSeen: now },
    { id: "cam3", tenantId: "home-123", name: "Doorbell", location: "Front Door", online: true, recording: true, lastSeen: now }
  ];
  const securityAlerts: SecurityAlert[] = [
    { id: "sec1", tenantId: "acme", severity: "medium", source: "network", title: "Unusual outbound traffic", description: "Spike detected to unknown ASN.", time: now, status: "open" },
    { id: "sec2", tenantId: "acme", severity: "high", source: "camera", title: "Motion after hours", description: "Movement detected in restricted zone.", time: now, status: "ack" },
    { id: "sec3", tenantId: "home-123", severity: "low", source: "endpoint", title: "Outdated firmware", description: "Robot vacuum needs update.", time: now, status: "open" }
  ];
  return { tenants, users, agents, securityAlerts, cameras };
}

// Simple mutex to avoid concurrent write corruption in dev
let writing = Promise.resolve();

export async function withDb<T>(fn: (db: DbSchema) => Promise<T> | T): Promise<T> {
  const db = await loadDb();
  const result = await fn(db);
  // If function changed db by mutation, caller should call save.
  return result;
}

export async function readDb(): Promise<DbSchema> {
  return loadDb();
}

export async function writeDb(mutator: (db: DbSchema) => void | Promise<void>) {
  const exec = async () => {
    const db = await loadDb();
    await mutator(db);
    await saveDb(db);
  };
  // queue writes
  writing = writing.then(exec, exec);
  return writing;
}

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
