import {NextRequest, NextResponse} from "next/server";
import {readDb} from "@/lib/store";
import {createSessionCookie} from "@/lib/auth";
import {Session} from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json().catch(() => ({}));
        if (!email || !password) {
            return NextResponse.json({error: "Email and password required"}, {status: 400});
        }
        const db = await readDb();
        const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user || user.password !== password) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        // Determine active tenant for session
        let tenantId: string | undefined = undefined;
        if (user.role === "business" || user.role === "consumer") tenantId = user.tenantId;
        if (user.role === "reseller" && user.managedTenantIds?.length) tenantId = user.managedTenantIds[0];

        const session: Session = {
            userId: user.id,
            tenantId,
            role: user.role,
            iat: Date.now(),
        };

        const cookie = createSessionCookie(session);
        const res = NextResponse.json({ok: true, user: {id: user.id, email: user.email, role: user.role, tenantId}});
        // @ts-ignore - next types
        res.cookies.set(cookie.name, cookie.value, cookie.options);
        return res;
    } catch (err) {
        console.error("/api/login error", err);
        return NextResponse.json({error: "Server error"}, {status: 500});
  }
}
