import * as fs from "fs";
import * as path from "path";
import { extractRecipe } from "@/lib/import/jsonld";

const FIXTURES = path.join(__dirname, "../lib/import/__fixtures__");

// ─── Synthetic HTML helpers ──────────────────────────────────────────────────

function page(ldJson: unknown): string {
  return `<html><head><script type="application/ld+json">${JSON.stringify(ldJson)}</script></head><body></body></html>`;
}

function pageMultiScript(blocks: unknown[]): string {
  const scripts = blocks
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join("\n");
  return `<html><head>${scripts}</head><body></body></html>`;
}

const BASE_RECIPE = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "Pasta Carbonara",
  description: "A classic Italian pasta dish.",
  recipeIngredient: ["200g spaghetti", "2 eggs", "100g pancetta"],
  recipeInstructions: [
    { "@type": "HowToStep", text: "Boil water and cook spaghetti." },
    { "@type": "HowToStep", text: "Fry pancetta until crisp." },
    { "@type": "HowToStep", text: "Mix eggs, cheese, and pasta." },
  ],
  image: "https://example.com/carbonara.jpg",
  recipeCategory: "Pasta",
  keywords: "italian, pasta, quick",
};

// ─── Basic extraction ────────────────────────────────────────────────────────

describe("extractRecipe — basic JSON-LD", () => {
  test("extracts title, description, ingredients, instructions, image, tags", () => {
    const result = extractRecipe(page(BASE_RECIPE));
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Pasta Carbonara");
    expect(result!.description).toBe("A classic Italian pasta dish.");
    expect(result!.ingredients).toHaveLength(3);
    expect(result!.instructions).toHaveLength(3);
    expect(result!.instructions[0]).toEqual({ stepNumber: 1, text: "Boil water and cook spaghetti." });
    expect(result!.imageUrl).toBe("https://example.com/carbonara.jpg");
    expect(result!.tags).toContain("pasta");
    expect(result!.tags).toContain("italian");
  });

  test("returns null for a page with no JSON-LD", () => {
    const html = "<html><head></head><body><p>No recipe here</p></body></html>";
    expect(extractRecipe(html)).toBeNull();
  });

  test("returns null for JSON-LD with no Recipe type", () => {
    const html = page({ "@type": "WebSite", name: "My Site" });
    expect(extractRecipe(html)).toBeNull();
  });
});

// ─── @graph support ─────────────────────────────────────────────────────────

describe("extractRecipe — @graph", () => {
  test("finds Recipe inside @graph array", () => {
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", name: "Carbonara Page" },
        { ...BASE_RECIPE },
      ],
    };
    const result = extractRecipe(page(ld));
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Pasta Carbonara");
  });
});

// ─── Array @type ─────────────────────────────────────────────────────────────

describe("extractRecipe — array @type", () => {
  test("finds Recipe when @type is an array", () => {
    const ld = { ...BASE_RECIPE, "@type": ["Recipe", "Thing"] };
    const result = extractRecipe(page(ld));
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Pasta Carbonara");
  });
});

// ─── Multiple script blocks ──────────────────────────────────────────────────

describe("extractRecipe — multiple script blocks", () => {
  test("skips non-Recipe block and returns Recipe from second block", () => {
    const result = extractRecipe(
      pageMultiScript([
        { "@type": "BreadcrumbList", itemListElement: [] },
        { ...BASE_RECIPE },
      ])
    );
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Pasta Carbonara");
  });

  test("skips malformed JSON-LD block and continues to next", () => {
    const html = `<html><head>
      <script type="application/ld+json">{ broken json !!!</script>
      <script type="application/ld+json">${JSON.stringify(BASE_RECIPE)}</script>
    </head><body></body></html>`;
    const result = extractRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Pasta Carbonara");
  });

  test("returns null when all JSON-LD blocks are malformed", () => {
    const html = `<html><head>
      <script type="application/ld+json">{ broken</script>
      <script type="application/ld+json">also { broken</script>
    </head><body></body></html>`;
    expect(extractRecipe(html)).toBeNull();
  });
});

// ─── recipeInstructions variants ─────────────────────────────────────────────

describe("extractRecipe — instruction formats", () => {
  test("handles string instructions (newline-separated)", () => {
    const ld = { ...BASE_RECIPE, recipeInstructions: "Step 1\nStep 2\nStep 3" };
    const result = extractRecipe(page(ld));
    expect(result!.instructions).toHaveLength(3);
    expect(result!.instructions[0].text).toBe("Step 1");
  });

  test("handles array of plain strings", () => {
    const ld = {
      ...BASE_RECIPE,
      recipeInstructions: ["Boil water.", "Add pasta.", "Drain."],
    };
    const result = extractRecipe(page(ld));
    expect(result!.instructions).toHaveLength(3);
    expect(result!.instructions[2].text).toBe("Drain.");
  });

  test("handles HowToStep objects", () => {
    const result = extractRecipe(page(BASE_RECIPE));
    expect(result!.instructions[1].text).toBe("Fry pancetta until crisp.");
  });

  test("assigns sequential stepNumbers starting at 1", () => {
    const result = extractRecipe(page(BASE_RECIPE));
    expect(result!.instructions.map((i) => i.stepNumber)).toEqual([1, 2, 3]);
  });
});

// ─── image variants ──────────────────────────────────────────────────────────

describe("extractRecipe — image extraction", () => {
  test("extracts string image", () => {
    const result = extractRecipe(page(BASE_RECIPE));
    expect(result!.imageUrl).toBe("https://example.com/carbonara.jpg");
  });

  test("extracts first URL from image array", () => {
    const ld = {
      ...BASE_RECIPE,
      image: [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
      ],
    };
    const result = extractRecipe(page(ld));
    expect(result!.imageUrl).toBe("https://example.com/img1.jpg");
  });

  test("extracts url from image object", () => {
    const ld = { ...BASE_RECIPE, image: { url: "https://example.com/obj.jpg" } };
    const result = extractRecipe(page(ld));
    expect(result!.imageUrl).toBe("https://example.com/obj.jpg");
  });

  test("returns null imageUrl when no image present", () => {
    const { image: _, ...noImage } = BASE_RECIPE;
    const result = extractRecipe(page(noImage));
    expect(result!.imageUrl).toBeNull();
  });
});

// ─── tags ────────────────────────────────────────────────────────────────────

describe("extractRecipe — tags", () => {
  test("lowercases and deduplicates tags from category + keywords", () => {
    const ld = { ...BASE_RECIPE, recipeCategory: "Pasta", keywords: "Italian, Pasta, Quick" };
    const result = extractRecipe(page(ld));
    expect(result!.tags).toEqual(expect.arrayContaining(["pasta", "italian", "quick"]));
    // pasta appears in both category and keywords — should be deduped
    expect(result!.tags.filter((t) => t === "pasta")).toHaveLength(1);
  });

  test("handles array-form recipeCategory", () => {
    const ld = { ...BASE_RECIPE, recipeCategory: ["Dinner", "Quick Meals"], keywords: "" };
    const result = extractRecipe(page(ld));
    expect(result!.tags).toContain("dinner");
    expect(result!.tags).toContain("quick meals");
  });
});

// ─── Live fixture: recipetineats ─────────────────────────────────────────────

describe("extractRecipe — live fixture (recipetineats.com)", () => {
  let html: string;

  beforeAll(() => {
    html = fs.readFileSync(path.join(FIXTURES, "recipetineats.html"), "utf-8");
  });

  test("extracts a non-empty title", () => {
    const result = extractRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.title.length).toBeGreaterThan(0);
  });

  test("extracts at least 5 ingredients", () => {
    const result = extractRecipe(html);
    expect(result!.ingredients.length).toBeGreaterThanOrEqual(5);
  });

  test("extracts at least 3 instruction steps", () => {
    const result = extractRecipe(html);
    expect(result!.instructions.length).toBeGreaterThanOrEqual(3);
  });

  test("each ingredient has a non-empty name", () => {
    const result = extractRecipe(html);
    for (const ing of result!.ingredients) {
      expect(ing.name.length).toBeGreaterThan(0);
    }
  });

  test("extracts an image URL", () => {
    const result = extractRecipe(html);
    expect(result!.imageUrl).toMatch(/^https?:\/\//);
  });
});
