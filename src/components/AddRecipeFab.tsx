"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function AddRecipeFab() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Link
      href="/recipes/new"
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(29,28,24,0.15)] hover:bg-primary-container transition-colors text-2xl z-40"
      aria-label="Add Recipe"
    >
      +
    </Link>
  );
}
