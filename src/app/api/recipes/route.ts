import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import { normaliseIngredients } from "@/lib/ingredients";
import { validateRecipeCreate } from "@/lib/validation";
import { formatRecipeResponse } from "@/lib/format";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.recipe.count(),
  ]);

  return NextResponse.json({
    recipes: recipes.map(formatRecipeResponse),
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    total,
  });
}

export async function POST(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const errors = validateRecipeCreate(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const ingredients = normaliseIngredients(body.ingredients);
  const instructions = body.instructions;
  const tagNames: string[] = (body.tags || []).map((t: string) =>
    t.trim().toLowerCase()
  );

  const recipe = await prisma.recipe.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      tags: {
        create: await Promise.all(
          tagNames.map(async (name: string) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              create: { name },
              update: {},
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(formatRecipeResponse(recipe), { status: 201 });
}
