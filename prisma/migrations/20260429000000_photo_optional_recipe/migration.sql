-- Make Photo.recipeId optional to support import-time photo storage before recipe creation
-- SQLite doesn't support DROP NOT NULL directly; recreate the table.

PRAGMA foreign_keys=OFF;

CREATE TABLE "Photo_new" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "url"       TEXT NOT NULL,
    "alt"       TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "recipeId"  TEXT,
    CONSTRAINT "Photo_recipe_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Photo_new" ("id","url","alt","sortOrder","recipeId")
  SELECT "id","url","alt","sortOrder","recipeId" FROM "Photo";

DROP TABLE "Photo";
ALTER TABLE "Photo_new" RENAME TO "Photo";

PRAGMA foreign_keys=ON;
