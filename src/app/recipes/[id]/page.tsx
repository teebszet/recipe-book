import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { RecipeActions } from "@/components/RecipeActions";
import { TrackRecentlyViewed } from "@/components/TrackRecentlyViewed";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!recipe) notFound();

  const ingredients = JSON.parse(recipe.ingredients) as {
    name: string;
    quantity: string | null;
    unit: string | null;
    notes: string | null;
  }[];
  const instructions = JSON.parse(recipe.instructions) as {
    stepNumber: number;
    text: string;
  }[];
  const tags = recipe.tags.map((rt) => rt.tag.name);

  return (
    <article>
      <TrackRecentlyViewed
        id={recipe.id}
        title={recipe.title}
        thumbnail={recipe.photos[0]?.url.replace(/^\/uploads\//, "/api/uploads/") || null}
      />

      {recipe.photos.length > 0 && (
        <div className="flex gap-4 overflow-x-auto -mx-4 px-4 mb-8">
          {recipe.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 w-full max-w-2xl aspect-[16/10] rounded-[1.5rem] overflow-hidden"
            >
              <Image
                src={photo.url.replace(/^\/uploads\//, "/api/uploads/")}
                alt={photo.alt || recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          ))}
        </div>
      )}

      <h1 className="font-serif text-3xl md:text-4xl text-on-surface mb-3">
        {recipe.title}
      </h1>

      {recipe.description && (
        <p className="text-on-surface-variant text-lg mb-4">
          {recipe.description}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded-full bg-surface-container-high text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
        <section>
          <h2 className="font-serif text-xl text-on-surface mb-4">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li
                key={i}
                className="bg-surface-container rounded-lg px-4 py-3"
              >
                <span className="font-medium">{ing.name}</span>
                {(ing.quantity || ing.unit) && (
                  <span className="text-on-surface-variant ml-2">
                    {ing.quantity} {ing.unit}
                  </span>
                )}
                {ing.notes && (
                  <span className="text-on-surface-variant ml-1 text-sm">
                    ({ing.notes})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-on-surface mb-4">
            Instructions
          </h2>
          <ol className="space-y-4">
            {instructions.map((step) => (
              <li key={step.stepNumber} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-medium text-on-surface-variant">
                  {step.stepNumber}
                </span>
                <p className="text-on-surface pt-1">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <RecipeActions recipeId={recipe.id} />

      <p className="text-xs text-on-surface-variant mt-8">
        Added{" "}
        {recipe.createdAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
