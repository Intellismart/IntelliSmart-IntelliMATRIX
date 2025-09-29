"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type CmsPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

type MenuItem = { label: string; href: string };

type Settings = { siteTitle: string; homePageSlug?: string };

export default function CMSAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [newPage, setNewPage] = useState<Partial<CmsPage>>({ title: "", slug: "", content: "", status: "draft" });
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ siteTitle: "Site", homePageSlug: "home" });
  const [tab, setTab] = useState<"pages" | "menu" | "settings">("pages");
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setErr(null);
    try {
      const [pgRes, menuRes, setRes] = await Promise.all([
        fetch("/api/cms/pages"),
        fetch("/api/cms/menu"),
        fetch("/api/cms/settings"),
      ]);
      if (pgRes.ok) setPages((await pgRes.json()).pages || []);
      if (menuRes.ok) setMenu((await menuRes.json()).menu || []);
      if (setRes.ok) setSettings((await setRes.json()).settings || { siteTitle: "Site" });
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function createPage() {
    setErr(null);
    try {
      const res = await fetch("/api/cms/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPage) });
      if (!res.ok) throw new Error((await res.json()).error || "Create failed");
      setNewPage({ title: "", slug: "", content: "", status: "draft" });
      await loadAll();
    } catch (e: any) { setErr(e?.message || "Create failed"); }
  }

  async function savePage(p: CmsPage) {
    setErr(null);
    try {
      const res = await fetch(`/api/cms/pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setEditing(null);
      await loadAll();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
  }

  async function deletePage(id: string) {
    if (!confirm("Delete this page?")) return;
    setErr(null);
    try {
      const res = await fetch(`/api/cms/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      await loadAll();
    } catch (e: any) { setErr(e?.message || "Delete failed"); }
  }

  async function saveMenu() {
    setErr(null);
    try {
      const res = await fetch("/api/cms/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ menu }) });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      await loadAll();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
  }

  async function saveSettings() {
    setErr(null);
    try {
      const res = await fetch("/api/cms/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      await loadAll();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CMS</h1>
          <p className="text-muted-foreground">Manage pages, menu and site settings.</p>
        </div>
        <nav className="flex gap-2">
          <Button variant={tab === "pages" ? undefined : "outline"} onClick={()=>setTab("pages")}>Pages</Button>
          <Button variant={tab === "menu" ? undefined : "outline"} onClick={()=>setTab("menu")}>Menu</Button>
          <Button variant={tab === "settings" ? undefined : "outline"} onClick={()=>setTab("settings")}>Settings</Button>
        </nav>
      </header>

      {err && <div className="text-sm text-red-500">{err}</div>}

      {tab === "pages" && (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="space-y-2">
            <h2 className="font-semibold">Create Page</h2>
            <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Title" value={newPage.title || ""} onChange={e=>setNewPage(p=>({ ...p, title: e.target.value }))} />
            <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Slug (optional)" value={newPage.slug || ""} onChange={e=>setNewPage(p=>({ ...p, slug: e.target.value }))} />
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-[150px]" placeholder="Content (HTML or Markdown)" value={newPage.content || ""} onChange={e=>setNewPage(p=>({ ...p, content: e.target.value }))} />
            <div className="flex items-center gap-2">
              <label className="text-sm">Status:</label>
              <select className="rounded-md border bg-background p-2 text-sm" value={newPage.status || "draft"} onChange={e=>setNewPage(p=>({ ...p, status: e.target.value as any }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <Button onClick={createPage}>Create</Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">Pages</h2>
            <ul className="divide-y rounded-md border">
              {pages.map(p => (
                <li key={p.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.title} <span className="text-xs text-muted-foreground">/{p.slug}</span></div>
                    <div className="text-xs text-muted-foreground">{p.status} • updated {new Date(p.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>setEditing(p)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={()=>window.open(`/p/${p.slug}`, "_blank")}>View</Button>
                    <Button size="sm" variant="destructive" onClick={()=>deletePage(p.id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "menu" && (
        <section className="space-y-2">
          <h2 className="font-semibold">Menu</h2>
          <div className="space-y-2">
            {menu.map((m, idx) => (
              <div key={idx} className="flex gap-2">
                <input className="flex-1 rounded-md border bg-background p-2 text-sm" placeholder="Label" value={m.label} onChange={e=>{
                  const copy = [...menu]; copy[idx] = { ...copy[idx], label: e.target.value }; setMenu(copy);
                }} />
                <input className="flex-1 rounded-md border bg-background p-2 text-sm" placeholder="Href" value={m.href} onChange={e=>{
                  const copy = [...menu]; copy[idx] = { ...copy[idx], href: e.target.value }; setMenu(copy);
                }} />
                <Button variant="destructive" onClick={()=>{ const copy=[...menu]; copy.splice(idx,1); setMenu(copy); }}>Remove</Button>
              </div>
            ))}
            <div>
              <Button variant="outline" onClick={()=> setMenu([...menu, { label: "New", href: "/p/home" }])}>Add Item</Button>
            </div>
            <div>
              <Button onClick={saveMenu}>Save Menu</Button>
            </div>
          </div>
        </section>
      )}

      {tab === "settings" && (
        <section className="space-y-2">
          <h2 className="font-semibold">Settings</h2>
          <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Site Title" value={settings.siteTitle} onChange={e=>setSettings(s=>({...s, siteTitle: e.target.value}))} />
          <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Home Page Slug (e.g., home)" value={settings.homePageSlug || ""} onChange={e=>setSettings(s=>({...s, homePageSlug: e.target.value}))} />
          <Button onClick={saveSettings}>Save Settings</Button>
        </section>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background text-foreground w-full max-w-2xl rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Edit Page</div>
              <Button variant="outline" onClick={()=>setEditing(null)}>Close</Button>
            </div>
            <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Title" value={editing.title} onChange={e=>setEditing(p=> p ? { ...p, title: e.target.value } : p)} />
            <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Slug" value={editing.slug} onChange={e=>setEditing(p=> p ? { ...p, slug: e.target.value } : p)} />
            <select className="rounded-md border bg-background p-2 text-sm" value={editing.status} onChange={e=>setEditing(p=> p ? { ...p, status: e.target.value as any } : p)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <textarea className="w-full rounded-md border bg-background p-2 text-sm min-h-[200px]" value={editing.content} onChange={e=>setEditing(p=> p ? { ...p, content: e.target.value } : p)} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button>
              {editing && <Button onClick={()=>savePage(editing)}>Save</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
