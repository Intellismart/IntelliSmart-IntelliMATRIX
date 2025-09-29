import {NextResponse} from "next/server";
import {requireAuth} from "@/lib/auth";
import {readDb, writeDb} from "@/lib/store";
import type {CmsPage} from "@/lib/types";

export const dynamic = "force-dynamic";

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth({minRole: "admin"});
    if (!auth.ok) return NextResponse.json({error: auth.message}, {status: auth.status});
    const {id} = await context.params;
    const body = await req.json().catch(() => ({}));
    const {title, slug, content, status} = body as Partial<CmsPage>;
    const db = await readDb();
    const cms = (db as any).cms;
    const page: CmsPage | undefined = cms?.pages?.find((p: CmsPage) => p.id === id);
    if (!page) return NextResponse.json({error: "Not found"}, {status: 404});
    const newSlug = slug ? slugify(slug) : undefined;
    if (newSlug && cms.pages.some((p: CmsPage) => p.slug === newSlug && p.id !== id)) {
        return NextResponse.json({error: "Slug already exists"}, {status: 409});
    }
    const now = new Date().toISOString();
    await writeDb(d => {
        const cms2 = ((d as any).cms = (d as any).cms || {pages: [], menu: [], settings: {siteTitle: "Site"}});
        const idx = cms2.pages.findIndex((p: CmsPage) => p.id === id);
        if (idx >= 0) {
            const cur = cms2.pages[idx];
            cms2.pages[idx] = {
                ...cur,
                title: title ?? cur.title,
                slug: newSlug ?? cur.slug,
                content: content ?? cur.content,
                status: (status === "published" || status === "draft") ? status : cur.status,
                updatedAt: now,
            };
        }
    });
    const db2 = await readDb();
    const page2: CmsPage | undefined = (db2 as any).cms?.pages?.find((p: CmsPage) => p.id === id);
    return NextResponse.json({page: page2});
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth({minRole: "admin"});
    if (!auth.ok) return NextResponse.json({error: auth.message}, {status: auth.status});
    const {id} = await context.params;
    await writeDb(db => {
        const cms = ((db as any).cms = (db as any).cms || {pages: [], menu: [], settings: {siteTitle: "Site"}});
        const before = cms.pages.length;
        cms.pages = cms.pages.filter((p: CmsPage) => p.id !== id);
    });
    return NextResponse.json({ok: true});
}
