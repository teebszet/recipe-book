import {
  getRecentlyViewed,
  addRecentlyViewed,
  RecentlyViewedEntry,
} from "@/lib/recently-viewed";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });
Object.defineProperty(global, "window", { value: global });

describe("getRecentlyViewed", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("returns empty array when nothing stored", () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("returns stored entries", () => {
    const entries: RecentlyViewedEntry[] = [
      { id: "1", title: "Pasta", thumbnail: null },
    ];
    localStorageMock.setItem(
      "recipe-book-recently-viewed",
      JSON.stringify(entries)
    );
    expect(getRecentlyViewed()).toEqual(entries);
  });

  it("returns empty array on parse error", () => {
    localStorageMock.setItem("recipe-book-recently-viewed", "not json{");
    localStorageMock.getItem.mockReturnValueOnce("not json{");
    expect(getRecentlyViewed()).toEqual([]);
  });
});

describe("addRecentlyViewed", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("adds entry to empty list", () => {
    const entry: RecentlyViewedEntry = {
      id: "1",
      title: "Pasta",
      thumbnail: null,
    };
    addRecentlyViewed(entry);
    const stored = JSON.parse(
      localStorageMock.setItem.mock.calls[0][1]
    ) as RecentlyViewedEntry[];
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(entry);
  });

  it("deduplicates by id, moving to front", () => {
    const existing: RecentlyViewedEntry[] = [
      { id: "1", title: "Pasta", thumbnail: null },
      { id: "2", title: "Soup", thumbnail: null },
    ];
    localStorageMock.setItem(
      "recipe-book-recently-viewed",
      JSON.stringify(existing)
    );

    addRecentlyViewed({ id: "2", title: "Soup Updated", thumbnail: "/img.jpg" });

    // Find the last setItem call (the one from addRecentlyViewed)
    const lastCall =
      localStorageMock.setItem.mock.calls[
        localStorageMock.setItem.mock.calls.length - 1
      ];
    const stored = JSON.parse(lastCall[1]) as RecentlyViewedEntry[];
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe("2");
    expect(stored[0].title).toBe("Soup Updated");
    expect(stored[1].id).toBe("1");
  });

  it("evicts oldest when exceeding 20 entries", () => {
    const existing: RecentlyViewedEntry[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      title: `Recipe ${i}`,
      thumbnail: null,
    }));
    localStorageMock.setItem(
      "recipe-book-recently-viewed",
      JSON.stringify(existing)
    );

    addRecentlyViewed({ id: "new", title: "New Recipe", thumbnail: null });

    const lastCall =
      localStorageMock.setItem.mock.calls[
        localStorageMock.setItem.mock.calls.length - 1
      ];
    const stored = JSON.parse(lastCall[1]) as RecentlyViewedEntry[];
    expect(stored).toHaveLength(20);
    expect(stored[0].id).toBe("new");
    // Last entry (id "19") should have been evicted
    expect(stored.find((e: RecentlyViewedEntry) => e.id === "19")).toBeUndefined();
  });
});
