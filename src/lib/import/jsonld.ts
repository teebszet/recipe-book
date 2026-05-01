import { parseHTML } from "linkedom";
import type { Ingredient } from "@/lib/ingredients";
import type { Instruction } from "@/lib/validation";

export interface ImportedRecipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  imageUrl: string | null;
}

// ─── schema.org/Recipe JSON-LD types (loose) ─────────────────────────────────

interface HowToStep {
  "@type"?: string;
  text?: string;
  name?: string;
}

interface SchemaRecipe {
  "@type": string | string[];
  name?: string;
  description?: string;
  recipeIngredient?: string[];
  recipeInstructions?: string | string[] | HowToStep[];
  image?: string | string[] | { url?: string };
  recipeCategory?: string | string[];
  keywords?: string | string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRecipeNode(obj: unknown): obj is SchemaRecipe {
  if (!obj || typeof obj !== "object") return false;
  const type = (obj as SchemaRecipe)["@type"];
  if (Array.isArray(type)) return type.includes("Recipe");
  return type === "Recipe";
}

/** Walk a parsed JSON-LD value looking for the first Recipe node. */
function findRecipe(value: unknown): SchemaRecipe | null {
  if (isRecipeNode(value)) return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipe(item);
      if (found) return found;
    }
    return null;
  }

  if (value && typeof value === "object") {
    // Check @graph
    const graph = (value as Record<string, unknown>)["@graph"];
    if (graph) {
      const found = findRecipe(graph);
      if (found) return found;
    }
  }

  return null;
}

function parseIngredient(raw: string): Ingredient {
  const s = raw.trim();
  if (!s) return { name: "", quantity: null, unit: null, notes: null };

  // Simple heuristic: "200g parmigiano reggiano, finely grated"
  // quantity (digits + decimal) + unit (letters) + name
  const match = s.match(/^([\d¼½¾⅓⅔⅛⅜⅝⅞.,/\s]+)\s*([a-zA-Z]+)?\s+(.+)$/);
  if (match) {
    const [, qty, unit, rest] = match;
    const notesMatch = rest.match(/^(.+?),\s*(.+)$/);
    if (notesMatch) {
      return {
        name: notesMatch[1].trim().toLowerCase(),
        quantity: qty.trim() || null,
        unit: unit?.trim().toLowerCase() || null,
        notes: notesMatch[2].trim() || null,
      };
    }
    return {
      name: rest.trim().toLowerCase(),
      quantity: qty.trim() || null,
      unit: unit?.trim().toLowerCase() || null,
      notes: null,
    };
  }

  // Fallback: whole string as name
  return { name: s.toLowerCase(), quantity: null, unit: null, notes: null };
}

function extractInstructions(
  raw: SchemaRecipe["recipeInstructions"]
): Instruction[] {
  if (!raw) return [];

  const texts: string[] = [];

  if (typeof raw === "string") {
    // Sometimes it's a block of text — split on newlines or numbered lines
    texts.push(...raw.split(/\n+/).map((s) => s.replace(/^\d+\.\s*/, "").trim()).filter(Boolean));
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === "string") {
        texts.push(item.trim());
      } else if (typeof item === "object" && item !== null) {
        const step = item as HowToStep;
        // HowToSection may have itemListElement
        const nested = (step as unknown as Record<string, unknown>)["itemListElement"];
        if (Array.isArray(nested)) {
          for (const sub of nested) {
            const subStep = sub as HowToStep;
            const t = subStep.text || subStep.name || "";
            if (t.trim()) texts.push(t.trim());
          }
        } else {
          const t = step.text || step.name || "";
          if (t.trim()) texts.push(t.trim());
        }
      }
    }
  }

  return texts
    .filter(Boolean)
    .map((text, i) => ({ stepNumber: i + 1, text }));
}

function extractImageUrl(image: SchemaRecipe["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    return (first as { url?: string }).url ?? null;
  }
  if (typeof image === "object") return (image as { url?: string }).url ?? null;
  return null;
}

function extractTags(recipe: SchemaRecipe): string[] {
  const raw: string[] = [];

  const addField = (v: string | string[] | undefined) => {
    if (!v) return;
    if (typeof v === "string") {
      // Keywords can be comma-separated
      raw.push(...v.split(",").map((s) => s.trim()));
    } else {
      raw.push(...v.map((s) => s.trim()));
    }
  };

  addField(recipe.recipeCategory);
  addField(recipe.keywords);

  return [
    ...new Set(
      raw
        .map((t) => t.toLowerCase())
        .filter(Boolean)
    ),
  ];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse HTML and extract the first schema.org/Recipe JSON-LD found.
 * Returns null if no recipe is found.
 */
export function extractRecipe(html: string): ImportedRecipe | null {
  const { document } = parseHTML(html);
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(script.textContent ?? "");
    } catch {
      // Skip malformed blocks
      continue;
    }

    const recipe = findRecipe(parsed);
    if (!recipe) continue;

    return {
      title: recipe.name?.trim() ?? "",
      description: recipe.description?.trim() ?? "",
      ingredients: (recipe.recipeIngredient ?? []).map(parseIngredient),
      instructions: extractInstructions(recipe.recipeInstructions),
      tags: extractTags(recipe),
      imageUrl: extractImageUrl(recipe.image),
    };
  }

  return null;
}
