"use client";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export function RecipeActions({ recipeId }: { recipeId: string }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAuthenticated) return null;

  async function handleDelete() {
    setDeleting(true);
    const res = await apiFetch(`/api/recipes/${recipeId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/");
    }
    setDeleting(false);
  }

  return (
    <div className="flex gap-3 mt-6">
      <Link
        href={`/recipes/${recipeId}/edit`}
        className="px-5 py-2 rounded-[0.75rem] bg-secondary-container text-secondary text-sm font-medium"
      >
        Edit
      </Link>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-5 py-2 text-sm text-error"
        >
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant">
            Are you sure?
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-[0.75rem] bg-error text-white text-sm font-medium disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-sm text-on-surface-variant"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
