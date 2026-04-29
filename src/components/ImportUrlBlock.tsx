"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface ImportedIngredient {
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
}

interface ImportedInstruction {
  stepNumber: number;
  text: string;
}

interface ImportedPhoto {
  id: string;
  url: string;
}

export interface ImportedFormData {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string; unit: string; notes: string }[];
  instructions: ImportedInstruction[];
  tags: string[];
  photos: { id: string; url: string; alt: null }[];
}

interface Props {
  onImport: (data: ImportedFormData) => void;
}

export function ImportUrlBlock({ onImport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }

      const data = await res.json();

      // Map nullable import types → form's non-nullable Ingredient shape
      const ingredients: ImportedFormData["ingredients"] = (
        (data.ingredients ?? []) as ImportedIngredient[]
      ).map((ing) => ({
        name: ing.name ?? "",
        quantity: ing.quantity ?? "",
        unit: ing.unit ?? "",
        notes: ing.notes ?? "",
      }));

      const photos: ImportedFormData["photos"] = (
        (data.photos ?? []) as ImportedPhoto[]
      ).map((p) => ({ id: p.id, url: p.url, alt: null }));

      onImport({
        title: data.title ?? "",
        description: data.description ?? "",
        ingredients,
        instructions: data.instructions ?? [],
        tags: data.tags ?? [],
        photos,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm text-primary hover:underline"
        >
          ↓ Import from URL
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 p-4 border border-outline-variant rounded-lg bg-surface-container">
      <p className="text-sm font-medium text-on-surface mb-3">
        Import from URL
      </p>
      <p className="text-xs text-on-surface-variant mb-3">
        Paste a link to a recipe page. Works best with sites that publish
        structured recipe data (JSON-LD). Cloudflare-protected sites may not
        import.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleImport();
            }
          }}
          placeholder="https://example.com/recipe"
          className="flex-1 border border-outline rounded px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="px-4 py-2 text-sm rounded bg-primary text-on-primary font-medium disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import"}
        </button>
        <button
          type="button"
          onClick={() => { setExpanded(false); setError(null); setUrl(""); }}
          className="px-3 py-2 text-sm rounded border border-outline text-on-surface-variant"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
