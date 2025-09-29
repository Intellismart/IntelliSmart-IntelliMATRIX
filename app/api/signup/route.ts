import {NextRequest, NextResponse} from "next/server";
import {genId, readDb, writeDb} from "@/lib/store";
import {Session, Tenant, User} from "@/lib/types";
import {createSessionCookie} from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(input: string) {
    return String(input)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const {email, password, name, accountType = "consumer", company} = body as {
            email?: string;
            password?: string;
            name?: string;
            accountType?: "consumer" | "business";
            company?: string;
        };

        if (!email || !password || !name) {
            return NextResponse.json({error: "name, email, password required"}, {status: 400});
        }

        const db = await readDb();

        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return NextResponse.json({error: "Account already exists"}, {status: 409});
        }

        let tenantId: string | undefined = undefined;
        let newTenant: Tenant | null = null;

        if (accountType === "business") {
            if (!company) {
                return NextResponse.json({error: "company required for business accounts"}, {status: 400});
            }
            let slug = slugify(company);
            if (!slug) slug = `org-${Math.random().toString(36).slice(2, 8)}`;
            // ensure uniqueness
            let unique = slug;
            let i = 1;
            while (db.tenants.some(t => t.id === unique)) {
                unique = `${slug}-${i++}`;
            }
            tenantId = unique;
            newTenant = {id: tenantId, name: company, createdAt: new Date().toISOString()};
        } else {
            // consumer: create a personal tenant to keep data model consistent
            const base = slugify(name || email.split("@")[0]);
            let unique = base || `user-${Math.random().toString(36).slice(2, 8)}`;
            let i = 1;
            while (db.tenants.some(t => t.id === unique)) {
                unique = `${base}-${i++}`;
            }
            tenantId = unique;
            newTenant = {id: tenantId, name: `${name}'s Home`, createdAt: new Date().toISOString()};
        }

        const role: User["role"] = accountType === "business" ? "business" : "consumer";
        const user: User = {
            id: genId("user"),
            email,
            name,
            role,
            tenantId,
            // Demo only: passwords are stored plaintext; replace with hashing/NextAuth in prod
            password,
        };

        await writeDb(dbm => {
            if (newTenant) dbm.tenants.push(newTenant);
            dbm.users.push(user);
        });

        const session: Session = {
            userId: user.id,
            role: user.role,
            tenantId: user.tenantId,
            iat: Date.now(),
        };
        const cookie = createSessionCookie(session);
        const res = NextResponse.json({
            ok: true,
            user: {id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId},
            tenant: newTenant,
        });
        // @ts-ignore
        res.cookies.set(cookie.name, cookie.value, cookie.options);
        return res;
    } catch (err) {
        console.error("/api/signup error", err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
