import { prisma } from "@/lib/db";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

interface SearchResult {
  id: string;
  title: string;
  createdAt: Date;
  tags: { tag: { name: string } }[];
  photos: { id: string; url: string; alt: string | null }[];
  matchType: string;
  matchContext: string | null;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let results: SearchResult[] = [];

  if (!query) {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    results = recipes.map((r) => ({
      ...r,
      matchType: "all",
      matchContext: null,
    }));
  } else {
    // Title matches first
    const titleMatches = await prisma.recipe.findMany({
      where: { title: { contains: query } },
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    const titleIds = new Set(titleMatches.map((r) => r.id));

    // Ingredient matches
    const ingredientCandidates = await prisma.recipe.findMany({
      where: { ingredients: { contains: query } },
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    const ingredientMatches = ingredientCandidates.filter((r) => {
      if (titleIds.has(r.id)) return false;
      const ings = JSON.parse(r.ingredients) as { name: string }[];
      return ings.some((ing) =>
        ing.name.toLowerCase().includes(query.toLowerCase())
      );
    });

    results = [
      ...titleMatches.map((r) => ({
        ...r,
        matchType: "title" as const,
        matchContext: `Title: ${r.title}`,
      })),
      ...ingredientMatches.map((r) => {
        const ings = JSON.parse(r.ingredients) as { name: string }[];
        const matched = ings.find((ing) =>
          ing.name.toLowerCase().includes(query.toLowerCase())
        );
        return {
          ...r,
          matchType: "ingredient" as const,
          matchContext: matched
            ? `Matched ingredient: ${matched.name}`
            : null,
        };
      }),
    ];
  }

  return (
    <>
      <SearchBar initialQuery={query} />

      <p className="text-sm text-on-surface-variant mb-6">
        {results.length === 0
          ? "No recipes found"
          : `${results.length} recipe${results.length !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-on-surface-variant">
            Try a different search term or browse all recipes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <div key={result.id}>
              <RecipeCard
                id={result.id}
                title={result.title}
                tags={result.tags.map((rt) => rt.tag.name)}
                createdAt={result.createdAt.toISOString()}
                thumbnail={
                  result.photos[0]
                    ? { url: result.photos[0].url, alt: result.photos[0].alt }
                    : null
                }
              />
              {result.matchContext && (
                <p className="mt-1 px-2 text-xs text-on-surface-variant">
                  {result.matchContext}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
