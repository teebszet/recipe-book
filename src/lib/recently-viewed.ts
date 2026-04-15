const STORAGE_KEY = "recipe-book-recently-viewed";
const MAX_ENTRIES = 20;

export interface RecentlyViewedEntry {
  id: string;
  title: string;
  thumbnail: string | null;
}

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(entry: RecentlyViewedEntry): void {
  const list = getRecentlyViewed().filter((e) => e.id !== entry.id);
  list.unshift(entry);
  if (list.length > MAX_ENTRIES) list.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
