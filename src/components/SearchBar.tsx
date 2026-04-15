"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes by name or ingredient..."
        className="w-full px-5 py-3 rounded-xl bg-surface-container-highest text-on-surface placeholder:text-outline text-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-outline/30 transition-colors"
      />
    </form>
  );
}
