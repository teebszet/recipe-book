"use client";

import { RecipeForm } from "@/components/RecipeForm";
import Link from "next/link";

export default function NewRecipePage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Back
        </Link>
      </div>
      <h1 className="font-serif text-2xl text-on-surface mb-6">
        Add New Recipe
      </h1>
      <RecipeForm />
    </>
  );
}
