export type FeedItem = {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
  category?: string;
};

// Very lightweight XML <item> parser for common RSS feeds (title/link/pubDate)
// Not robust for all feeds but sufficient for demo purposes without extra deps.
export async function fetchRssItems(url: string, opts?: { limit?: number; revalidate?: number; category?: string; source?: string }): Promise<FeedItem[]> {
  const { limit = 6, revalidate = 60 * 60 * 24, category, source } = opts || {};

  // Use Next.js fetch with caching when available
  const res = await fetch(url, { next: { revalidate } });
  const xml = await res.text();

  // Extract <item>...</item>
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gim;
  const titleRegex = /<title>([\s\S]*?)<\/title>/i;
  const linkRegex = /<link>([\s\S]*?)<\/link>/i;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;

  const matches = xml.match(itemRegex) || [];
  for (const block of matches) {
    const title = decodeHtml((block.match(titleRegex)?.[1] || '').trim());
    let link = decodeHtml((block.match(linkRegex)?.[1] || '').trim());
    const pubDate = (block.match(pubDateRegex)?.[1] || '').trim();

    // Some feeds put <guid> instead of <link>, fallback
    if (!link) {
      const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      if (guidMatch) link = decodeHtml(guidMatch[1].trim());
    }

    if (title && link) {
      items.push({ title, link, pubDate, category, source });
    }
    if (items.length >= limit) break;
  }
  return items;
}

export async function fetchNewsCategories() {
  // Google News RSS searches per category
  const day = 60 * 60 * 24; // seconds
  const categories = [
    { key: 'ai', label: 'AI', url: 'https://news.google.com/rss/search?q=%22artificial+intelligence%22+OR+AI&hl=en-US&gl=US&ceid=US:en' },
    { key: 'robotics', label: 'Robotics', url: 'https://news.google.com/rss/search?q=robotics+OR+robots&hl=en-US&gl=US&ceid=US:en' },
    { key: 'autonomous', label: 'Autonomous Vehicles', url: 'https://news.google.com/rss/search?q=autonomous+vehicles+OR+self-driving+drones&hl=en-US&gl=US&ceid=US:en' },
    { key: 'smarthome', label: 'Smart Home', url: 'https://news.google.com/rss/search?q=smart+home+OR+home+automation+robot+vacuum&hl=en-US&gl=US&ceid=US:en' },
  ];

  const results = await Promise.all(
    categories.map(c => fetchRssItems(c.url, { limit: 6, revalidate: day, category: c.label, source: 'Google News' }))
  );

  const map: Record<string, FeedItem[]> = {};
  categories.forEach((c, i) => { map[c.key] = results[i]; });
  return map;
}

export async function fetchReviewsFeeds() {
  const day = 60 * 60 * 24;
  const feeds = [
    { label: 'Engadget Reviews', url: 'https://www.engadget.com/reviews/rss.xml' },
    { label: 'TechRadar Smart Home Reviews', url: 'https://www.techradar.com/rss/reviews/smart-home' },
  ];
  const items = (
    await Promise.all(
      feeds.map(f => fetchRssItems(f.url, { limit: 6, revalidate: day, source: f.label, category: 'Reviews' }))
    )
  ).flat();
  return items;
}

export function dailyTipIndex(mod: number) {
  const now = new Date();
  // YYYYMMDD hash to cycle daily
  const key = Number(`${now.getUTCFullYear()}${(now.getUTCMonth()+1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')}`);
  return key % mod;
}

export function getDailyTips() {
  // Curated rotating set; rotates by day deterministically
  const tips = [
    'Label your datasets clearly and version them; training without data lineage is asking for trouble.',
    'Start with narrow tasks for your first robot/agent; expand capabilities after you’ve measured ROI.',
    'For drones, always simulate missions first; geofencing and battery margins save hardware (and budgets).',
    'Use intent routers to direct customer messages: FAQ -> RAG, transactional -> tool calls, complex -> human.',
    'Smart home automations: create “fail‑safe” scenes for power/network loss and test monthly.',
    'IoT security: rotate credentials and isolate devices on a separate VLAN; never expose direct device ports.',
    'Measure latency budgets per workflow; 100ms here and 200ms there can tank UX on voice robots.',
    'Prefer streaming UIs for long LLM responses; perceived performance beats raw tokens/sec.',
  ];

  const idx = dailyTipIndex(tips.length);
  // Return 5 tips starting from today’s index, wrapping around
  const out: string[] = [];
  for (let i = 0; i < 5; i++) out.push(tips[(idx + i) % tips.length]);
  return out;
}

function decodeHtml(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
