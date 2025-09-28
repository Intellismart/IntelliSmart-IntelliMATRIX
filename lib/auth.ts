import { cookies } from "next/headers";
import crypto from "crypto";
import { readDb } from "./store";
import { Role, Session } from "./types";

const SESSION_COOKIE = "session";

function getSecret() {
  return process.env.SESSION_SECRET || "dev-demo-secret";
}

function sign(data: string) {
  const h = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return h;
}

export function encodeSession(s: Session) {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(token?: string): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected !== sig) return null;
  try {
    const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return obj as Session;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return decodeSession(token);
}

export async function createSession(userId: string, role: Role, tenantId?: string) {
  const s: Session = { userId, role, tenantId, iat: Date.now() };
  const token = encodeSession(s);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
  return s;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAuth(minRole?: Role) {
  const s = await getSession();
  if (!s) return { ok: false as const, status: 401, message: "Unauthorized" };
  if (minRole) {
    const order: Role[] = ["consumer", "business", "reseller", "admin"];
    if (order.indexOf(s.role) < order.indexOf(minRole)) {
      return { ok: false as const, status: 403, message: "Forbidden" };
    }
  }
  // attach user
  const db = await readDb();
  const user = db.users.find(u => u.id === s.userId);
  if (!user) return { ok: false as const, status: 401, message: "Unauthorized" };
  return { ok: true as const, session: s, user };
}
