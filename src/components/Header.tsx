"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME } from "@/lib/branding";

export function Header() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal, logout } = useAuth();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="bg-surface-container-lowest">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="font-serif text-xl text-primary whitespace-nowrap"
        >
          {APP_NAME}
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes by name or ingredient..."
            className="w-full px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-outline/30 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-secondary font-medium">Contributor</span>
              <button
                onClick={logout}
                className="text-on-surface-variant hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-on-surface-variant hover:text-primary"
            >
              Contributor login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
