import { parseHTML } from "linkedom";

export interface OpenGraphData {
  title: string;
  description: string;
  imageUrl: string | null;
}

/**
 * Extract Open Graph metadata from an HTML page.
 * Falls back to <title> if og:title is absent.
 * Returns null only if no title at all is found.
 */
export function extractOpenGraph(html: string): OpenGraphData | null {
  const { document } = parseHTML(html);

  const getMeta = (property: string): string => {
    const el =
      document.querySelector(`meta[property="${property}"]`) ??
      document.querySelector(`meta[name="${property}"]`);
    return (el?.getAttribute("content") ?? "").trim();
  };

  const title =
    getMeta("og:title") ||
    document.querySelector("title")?.textContent?.trim() ||
    "";

  if (!title) return null;

  const description = getMeta("og:description");
  const imageUrl = getMeta("og:image") || null;

  return { title, description, imageUrl: imageUrl || null };
}
