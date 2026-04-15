import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) notFound();

  const ingredients = JSON.parse(recipe.ingredients);
  const instructions = JSON.parse(recipe.instructions);
  const tags = recipe.tags.map((rt) => rt.tag.name);

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/recipes/${id}`}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Back to recipe
        </Link>
      </div>
      <h1 className="font-serif text-2xl text-on-surface mb-6">
        Edit Recipe
      </h1>
      <RecipeForm
        recipeId={id}
        initialData={{
          title: recipe.title,
          description: recipe.description || "",
          ingredients,
          instructions,
          tags,
        }}
      />
    </>
  );
}
