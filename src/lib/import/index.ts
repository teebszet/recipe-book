import { safeFetchText } from "./fetch";
import { extractRecipe, type ImportedRecipe } from "./jsonld";
import { extractOpenGraph } from "./og";
import { downloadAndStoreImage, type ImportedPhoto } from "./image";
import type { Ingredient } from "@/lib/ingredients";
import type { Instruction } from "@/lib/validation";

export interface ImportResult {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  photos: ImportedPhoto[];
}

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

function isInstagramUrl(url: URL): boolean {
  return INSTAGRAM_HOSTS.has(url.hostname);
}

/**
 * Fetch a URL and extract recipe data. Returns a partial ImportResult —
 * callers should expect any field to be empty/empty-array when parsing fails.
 *
 * Throws on unrecoverable errors (invalid URL scheme, SSRF, HTTP error).
 * Returns gracefully-degraded result on soft failures (no JSON-LD, bad image).
 */
export async function importFromUrl(rawUrl: string): Promise<ImportResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (isInstagramUrl(parsed)) {
    // Phase 2 — not yet implemented. Return a clear error.
    throw new Error(
      "Instagram import is not yet supported. Please add this recipe manually."
    );
  }

  // Fetch the page
  const html = await safeFetchText(rawUrl);

  // Try JSON-LD first
  const jsonldRecipe: ImportedRecipe | null = extractRecipe(html);

  let base: Omit<ImportResult, "photos">;
  let imageUrl: string | null = null;

  if (jsonldRecipe) {
    base = {
      title: jsonldRecipe.title,
      description: jsonldRecipe.description,
      ingredients: jsonldRecipe.ingredients,
      instructions: jsonldRecipe.instructions,
      tags: jsonldRecipe.tags,
    };
    imageUrl = jsonldRecipe.imageUrl;
  } else {
    // OG fallback
    const og = extractOpenGraph(html);
    if (!og) {
      throw new Error(
        "Could not extract recipe data from this URL. The page may require a login or does not contain a parseable recipe."
      );
    }
    base = {
      title: og.title,
      description: og.description,
      ingredients: [],
      instructions: [],
      tags: [],
    };
    imageUrl = og.imageUrl;
  }

  // Download image (best-effort — failure doesn't fail the import)
  const photos: ImportedPhoto[] = [];
  if (imageUrl) {
    const photo = await downloadAndStoreImage(imageUrl);
    if (photo) photos.push(photo);
  }

  return { ...base, photos };
}
