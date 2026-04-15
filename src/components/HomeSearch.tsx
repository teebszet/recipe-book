"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="mb-10 text-center">
      <h1 className="font-serif text-3xl md:text-4xl text-on-surface mb-2">
        Recipe Book
      </h1>
      <p className="text-on-surface-variant mb-6">
        Find your favourite recipes
      </p>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes by name or ingredient..."
          className="w-full px-5 py-3 rounded-xl bg-surface-container-highest text-on-surface placeholder:text-outline text-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-outline/30 transition-colors shadow-[0_8px_24px_rgba(29,28,24,0.06)]"
        />
      </form>
    </section>
  );
}
