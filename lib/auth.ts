import {cookies} from "next/headers";
import crypto from "crypto";
import {readDb} from "./store";
import {Session} from "./types";

// Simple HMAC-signed session token (demo only; replace with NextAuth/SSO in prod)
// Format: base64url(payload).base64url(signature)
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
    return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function b64url(input: Buffer | string) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function sign(data: string): string {
    const h = crypto.createHmac("sha256", getSecret());
    h.update(data);
    return b64url(h.digest());
}

export function encodeSession(session: Session): string {
    const payload = JSON.stringify(session);
    const body = b64url(payload);
    const sig = sign(body);
    return `${body}.${sig}`;
}

export function decodeSession(token: string | undefined | null): Session | null {
  if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    if (sign(body) !== sig) return null;
  try {
      const json = Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
      const s = JSON.parse(json) as Session;
      return s;
  } catch {
    return null;
  }
}

export function getRequestSession(cookieValue?: string): Session | null {
    const token = cookieValue ?? cookies().get("session")?.value;
  return decodeSession(token);
}

export function createSessionCookie(session: Session, ttlMs = DEFAULT_TTL_MS) {
    const token = encodeSession(session);
    const expires = new Date(Date.now() + ttlMs);
    return {
        name: "session",
        value: token,
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            expires,
        },
    };
}

export function clearSessionCookie() {
    return {
        name: "session",
        value: "",
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            expires: new Date(0),
        },
    };
}


export async function requireAuth(opts?: { minRole?: import("./types").Role }) {
    const token = cookies().get("session")?.value;
    const session = decodeSession(token);
    if (!session) return {ok: false as const, status: 401, message: "Unauthorized"};
    const db = await readDb();
    const user = db.users.find(u => u.id === session.userId);
    if (!user) return {ok: false as const, status: 401, message: "Unauthorized"};
    if (opts?.minRole) {
        const hierarchy: import("./types").Role[] = ["consumer", "business", "reseller", "admin"];
        if (hierarchy.indexOf(user.role) < hierarchy.indexOf(opts.minRole)) {
            return {ok: false as const, status: 403, message: "Forbidden"};
        }
    }
    return {ok: true as const, session, user};
}

export async function createSession(userId: string, role: import("./types").Role, tenantId?: string) {
    const s: Session = {userId, role, tenantId, iat: Date.now()};
    const cookie = createSessionCookie(s);
    // next/headers cookies() in route handlers sets cookie on response
    cookies().set(cookie.name, cookie.value, cookie.options);
}
