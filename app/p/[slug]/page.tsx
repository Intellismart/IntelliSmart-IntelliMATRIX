import { readDb } from "@/lib/store";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CmsPage({ params }: { params: { slug: string } }) {
  const db = await readDb();
  const cms = (db as any).cms || { pages: [], settings: { siteTitle: "Site" }, menu: [] };
  const page = cms.pages.find((p: any) => p.slug === params.slug && p.status === "published");
  if (!page) return notFound();
  return (
    <div className="prose max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: page.content || "" }} />
    </div>
  );
}
