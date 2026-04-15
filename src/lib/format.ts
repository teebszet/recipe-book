import type { Prisma } from "@/generated/prisma/client";

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    tags: { include: { tag: true } };
    photos: true;
  };
}>;

type RecipeWithThumbnail = Prisma.RecipeGetPayload<{
  include: {
    tags: { include: { tag: true } };
    photos: true;
  };
}>;

export function formatRecipeResponse(recipe: RecipeWithRelations) {
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients),
    instructions: JSON.parse(recipe.instructions),
    tags: recipe.tags.map((rt: RecipeWithRelations["tags"][number]) => rt.tag.name),
    photos: recipe.photos.map((p: RecipeWithRelations["photos"][number]) => ({
      id: p.id,
      url: p.url,
      alt: p.alt,
    })),
  };
}

export function formatRecipeListItem(recipe: RecipeWithThumbnail) {
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients),
    instructions: JSON.parse(recipe.instructions),
    tags: recipe.tags.map((rt: RecipeWithThumbnail["tags"][number]) => rt.tag.name),
    photos: recipe.photos.map((p: RecipeWithThumbnail["photos"][number]) => ({
      id: p.id,
      url: p.url,
      alt: p.alt,
    })),
  };
}
