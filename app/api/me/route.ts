import {NextRequest, NextResponse} from "next/server";
import {getRequestSession} from "@/lib/auth";
import {readDb} from "@/lib/store";

export async function GET(req: NextRequest) {
    const cookie = req.headers.get("cookie") || undefined;
    const token = cookie?.split(";").find(p => p.trim().startsWith("session="))?.split("=")?.[1];
    const session = getRequestSession(token);
    if (!session) return NextResponse.json({user: null, session: null}, {status: 401});
  const db = await readDb();
    const user = db.users.find(u => u.id === session.userId);
    if (!user) return NextResponse.json({user: null, session: null}, {status: 401});
    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            managedTenantIds: user.managedTenantIds
        }, session
    });
}
