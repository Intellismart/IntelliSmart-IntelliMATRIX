import {NextResponse} from "next/server";
import {requireAuth} from "@/lib/auth";
import {genId, readDb, writeDb} from "@/lib/store";
import type {CmsPage} from "@/lib/types";

export const dynamic = "force-dynamic";

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function GET(req: Request) {
    const auth = await requireAuth({minRole: "admin"});
    if (!auth.ok) return NextResponse.json({error: auth.message}, {status: auth.status});
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const db = await readDb();
    const pages: CmsPage[] = ((db as any).cms?.pages || []) as CmsPage[];
    let out = pages;
    if (status === "published" || status === "draft") out = pages.filter(p => p.status === status);
    out = [...out].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return NextResponse.json({pages: out});
}

export async function POST(req: Request) {
    const auth = await requireAuth({minRole: "admin"});
    if (!auth.ok) return NextResponse.json({error: auth.message}, {status: auth.status});
    const body = await req.json().catch(() => ({}));
    const title: string | undefined = body?.title;
    let slug: string | undefined = body?.slug;
    const content: string = body?.content ?? "";
    const status: CmsPage["status"] = body?.status === "published" ? "published" : "draft";
    if (!title) return NextResponse.json({error: "title required"}, {status: 400});
    slug = slugify(slug || title);
    const now = new Date().toISOString();
    const page: CmsPage = {
        id: genId("page"),
        slug,
        title,
        content,
        status,
        authorUserId: auth.user.id,
        createdAt: now,
        updatedAt: now
    };
    try {
        await writeDb(db => {
            const cms = ((db as any).cms = (db as any).cms || {pages: [], menu: [], settings: {siteTitle: "Site"}});
            if (cms.pages.find((p: CmsPage) => p.slug === slug)) {
                throw Object.assign(new Error("slug exists"), {code: "SLUG_EXISTS"});
            }
            cms.pages.push(page);
        });
    } catch (e: any) {
        if (e?.code === "SLUG_EXISTS") return NextResponse.json({error: "Slug already exists"}, {status: 409});
        throw e;
    }
    return NextResponse.json({page});
}
