import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatRecipeResponse } from "@/lib/format";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!q) {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    return NextResponse.json({
      query: q,
      results: recipes.map((r) => ({
        ...formatRecipeResponse(r),
        matchType: null,
        matchContext: null,
      })),
      total: recipes.length,
    });
  }

  // Title matches
  const titleMatches = await prisma.recipe.findMany({
    where: { title: { contains: q } },
    orderBy: { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const titleMatchIds = new Set(titleMatches.map((r) => r.id));

  // Ingredient matches (search JSON string)
  const allRecipes = await prisma.recipe.findMany({
    where: { ingredients: { contains: q } },
    orderBy: { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const ingredientMatches = allRecipes.filter((r) => {
    if (titleMatchIds.has(r.id)) return false;
    const ingredients = JSON.parse(r.ingredients) as {
      name: string;
      notes?: string;
    }[];
    return ingredients.some(
      (ing) =>
        ing.name.toLowerCase().includes(q.toLowerCase()) ||
        ing.notes?.toLowerCase().includes(q.toLowerCase())
    );
  });

  const results = [
    ...titleMatches.map((r) => ({
      ...formatRecipeResponse(r),
      matchType: "title",
      matchContext: `Title: ${r.title}`,
    })),
    ...ingredientMatches.map((r) => {
      const ingredients = JSON.parse(r.ingredients) as { name: string }[];
      const matched = ingredients.find((ing) =>
        ing.name.toLowerCase().includes(q.toLowerCase())
      );
      return {
        ...formatRecipeResponse(r),
        matchType: "ingredient",
        matchContext: matched ? `Matched ingredient: ${matched.name}` : null,
      };
    }),
  ];

  return NextResponse.json({
    query: q,
    results,
    total: results.length,
  });
}
