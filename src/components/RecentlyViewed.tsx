"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getRecentlyViewed,
  RecentlyViewedEntry,
} from "@/lib/recently-viewed";

export function RecentlyViewed() {
  const [entries, setEntries] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    setEntries(getRecentlyViewed());
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl text-on-surface mb-4">
        Recently Viewed
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/recipes/${entry.id}`}
            className="flex-shrink-0 w-36"
          >
            <div className="bg-surface-container rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(29,28,24,0.06)]">
              {entry.thumbnail ? (
                <div className="relative aspect-square">
                  <Image
                    src={entry.thumbnail}
                    alt={entry.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-surface-container-high flex items-center justify-center">
                  <span className="text-outline text-2xl">🍽</span>
                </div>
              )}
              <p className="p-2 text-sm font-serif text-on-surface line-clamp-2">
                {entry.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
