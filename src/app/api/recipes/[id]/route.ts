import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import { normaliseIngredients } from "@/lib/ingredients";
import { formatRecipeResponse } from "@/lib/format";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json(formatRecipeResponse(recipe));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined)
    updateData.description = body.description?.trim() || null;
  if (body.ingredients !== undefined)
    updateData.ingredients = JSON.stringify(
      normaliseIngredients(body.ingredients)
    );
  if (body.instructions !== undefined)
    updateData.instructions = JSON.stringify(body.instructions);

  if (body.tags !== undefined) {
    const tagNames: string[] = body.tags.map((t: string) =>
      t.trim().toLowerCase()
    );

    await prisma.recipeTag.deleteMany({ where: { recipeId: id } });

    for (const name of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await prisma.recipeTag.create({
        data: { recipeId: id, tagId: tag.id },
      });
    }
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(formatRecipeResponse(recipe));
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");

  for (const photo of existing.photos) {
    const filePath = path.join(uploadDir, path.basename(photo.url));
    try {
      await fs.unlink(filePath);
    } catch {
      // File may already be deleted
    }
  }

  await prisma.recipe.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
