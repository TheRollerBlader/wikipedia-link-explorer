import { OFFLINE_KNOWLEDGE_BASE, inferCategory } from './offlineData';

export interface WikiSummary {
  title: string;
  extract: string;
  description?: string;
  thumbnailUrl?: string;
  pageUrl: string;
}

export interface WikiSearchResult {
  title: string;
  snippet?: string;
}

// In-memory cache to guarantee fast repeated requests
const summaryCache = new Map<string, WikiSummary>();
const linksCache = new Map<string, string[]>();
const searchCache = new Map<string, WikiSearchResult[]>();

// Filter prefixes that are not main encyclopedic articles
const EXCLUDED_PREFIXES = [
  'file:',
  'category:',
  'template:',
  'template talk:',
  'help:',
  'wikipedia:',
  'portal:',
  'talk:',
  'special:',
  'draft:',
  'timedtext:',
  'module:'
];

export function cleanTitle(title: string): string {
  return title.trim().replace(/_/g, ' ');
}

export function isValidArticleLink(title: string): boolean {
  if (!title || title.trim().length === 0) return false;
  const lower = title.toLowerCase();
  for (const prefix of EXCLUDED_PREFIXES) {
    if (lower.startsWith(prefix)) return false;
  }
  // Exclude purely numeric disambiguations, ISO codes, lists of years unless relevant
  if (lower.startsWith('list of')) return false;
  return true;
}

/**
 * Search Wikipedia articles with autocomplete
 */
export async function searchWikipediaArticles(query: string): Promise<WikiSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  if (searchCache.has(q.toLowerCase())) {
    return searchCache.get(q.toLowerCase())!;
  }

  // Check offline knowledge base matches first
  const offlineMatches = Object.keys(OFFLINE_KNOWLEDGE_BASE)
    .filter(k => k.toLowerCase().includes(q.toLowerCase()))
    .map(title => ({
      title,
      snippet: OFFLINE_KNOWLEDGE_BASE[title].description
    }));

  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      q
    )}&limit=8&namespace=0&format=json&origin=*`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // data format: [query, [titles], [descriptions], [urls]]
      const titles: string[] = data[1] || [];
      const descriptions: string[] = data[2] || [];

      const results: WikiSearchResult[] = titles
        .filter(isValidArticleLink)
        .map((title, idx) => ({
          title: cleanTitle(title),
          snippet: descriptions[idx] || undefined
        }));

      if (results.length > 0) {
        searchCache.set(q.toLowerCase(), results);
        return results;
      }
    }
  } catch (err) {
    console.warn(`[WikipediaAPI] Live search failed for "${q}", using fallback:`, err);
  }

  return offlineMatches.length > 0
    ? offlineMatches
    : [{ title: q, snippet: 'Direct article lookup' }];
}

/**
 * Fetch summary and thumbnail for a given article title
 */
export async function fetchArticleSummary(title: string): Promise<WikiSummary> {
  const clean = cleanTitle(title);
  if (summaryCache.has(clean)) {
    return summaryCache.get(clean)!;
  }

  // Check offline dataset
  const offline = OFFLINE_KNOWLEDGE_BASE[clean];

  try {
    const restEndpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(restEndpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const summary: WikiSummary = {
        title: data.title || clean,
        extract: data.extract || offline?.summary || 'No summary available.',
        description: data.description || offline?.description,
        thumbnailUrl: data.thumbnail?.source || offline?.thumbnail,
        pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(clean)}`
      };
      summaryCache.set(clean, summary);
      return summary;
    }
  } catch {
    // REST API failed, try Action API as fallback
    try {
      const actionEndpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&exsentences=3&pithumbsize=320&titles=${encodeURIComponent(
        clean
      )}&format=json&origin=*`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(actionEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && pageId !== '-1') {
            const summary: WikiSummary = {
              title: page.title || clean,
              extract: page.extract || offline?.summary || 'No summary available.',
              thumbnailUrl: page.thumbnail?.source || offline?.thumbnail,
              pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(clean)}`
            };
            summaryCache.set(clean, summary);
            return summary;
          }
        }
      }
    } catch {
      // Fall through to offline cache
    }
  }

  // Fallback to offline data or synthetic placeholder
  const fallbackSummary: WikiSummary = {
    title: clean,
    extract:
      offline?.summary ||
      `"${clean}" is a Wikipedia article. Click on the node or the external link to view its full encyclopedia page.`,
    description: offline?.description || `${inferCategory(clean)} article`,
    thumbnailUrl: offline?.thumbnail,
    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(clean)}`
  };
  summaryCache.set(clean, fallbackSummary);
  return fallbackSummary;
}

/**
 * Fetch outgoing links for an article
 */
export async function fetchArticleLinks(title: string, limit: number = 20): Promise<string[]> {
  const clean = cleanTitle(title);
  if (linksCache.has(clean)) {
    return linksCache.get(clean)!.slice(0, limit);
  }

  // Check offline dataset
  const offline = OFFLINE_KNOWLEDGE_BASE[clean];

  try {
    // MediaWiki action=query&prop=links
    // Fetch up to 80 links so we can filter and sample high-relevance ones
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      clean
    )}&prop=links&pllimit=80&plnamespace=0&format=json&origin=*`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page && page.links && Array.isArray(page.links)) {
          const rawLinks: string[] = page.links
            .map((l: { title: string }) => cleanTitle(l.title))
            .filter(isValidArticleLink)
            .filter((l: string) => l.toLowerCase() !== clean.toLowerCase());

          if (rawLinks.length > 0) {
            linksCache.set(clean, rawLinks);
            return rawLinks.slice(0, limit);
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[WikipediaAPI] Live link fetch failed for "${clean}", using fallback:`, err);
  }

  // Offline fallback
  if (offline && offline.links && offline.links.length > 0) {
    linksCache.set(clean, offline.links);
    return offline.links.slice(0, limit);
  }

  // If completely unknown article, pick interesting interconnected articles based on keyword similarity
  const fallbackRelated = Object.keys(OFFLINE_KNOWLEDGE_BASE)
    .filter(k => k.toLowerCase() !== clean.toLowerCase())
    .slice(0, Math.min(limit, 8));

  linksCache.set(clean, fallbackRelated);
  return fallbackRelated;
}
