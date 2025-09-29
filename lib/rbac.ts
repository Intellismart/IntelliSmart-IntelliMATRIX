import {Role, Session, User} from "./types";

export function hasRole(session: Session | null, ...roles: Role[]) {
    if (!session) return false;
    return roles.includes(session.role);
}

export function canAccessTenant(session: Session | null, tenantId: string | undefined, user: User | null): boolean {
    if (!session) return false;
    if (!tenantId) return false;
    if (session.role === "admin") return true;
    if (session.role === "business" || session.role === "consumer") {
        return session.tenantId === tenantId && user?.tenantId === tenantId;
    }
    if (session.role === "reseller") {
        return (user?.managedTenantIds || []).includes(tenantId);
    }
    return false;
}

export function requireRole(session: Session | null, ...roles: Role[]) {
    if (!hasRole(session, ...roles)) {
        throw Object.assign(new Error("Forbidden"), {status: 403});
    }
}
