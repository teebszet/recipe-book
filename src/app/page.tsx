import { prisma } from "@/lib/db";
import { RecipeCard } from "@/components/RecipeCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { AddRecipeFab } from "@/components/AddRecipeFab";
import { HomeSearch } from "@/components/HomeSearch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      tags: { include: { tag: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <>
      <HomeSearch />
      <RecentlyViewed />

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-on-surface-variant text-lg">
            No recipes yet. Be the first to add one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              tags={recipe.tags.map((rt) => rt.tag.name)}
              createdAt={recipe.createdAt.toISOString()}
              thumbnail={
                recipe.photos[0]
                  ? {
                      url: recipe.photos[0].url,
                      alt: recipe.photos[0].alt,
                    }
                  : null
              }
            />
          ))}
        </div>
      )}

      <AddRecipeFab />
    </>
  );
}
