import Link from "next/link";
import Image from "next/image";

interface RecipeCardProps {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  thumbnail?: { url: string; alt: string | null } | null;
}

export function RecipeCard({
  id,
  title,
  tags,
  createdAt,
  thumbnail,
}: RecipeCardProps) {
  return (
    <Link href={`/recipes/${id}`} className="group block">
      <div className="bg-surface-container rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_rgba(29,28,24,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(29,28,24,0.1)]">
        {thumbnail ? (
          <div className="relative aspect-[4/3] bg-surface-container-high">
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt || title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-surface-container-high flex items-center justify-center">
            <span className="text-outline text-4xl">🍽</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-surface-container-high text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-on-surface-variant">
            {new Date(createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
