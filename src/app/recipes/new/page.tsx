"use client";

import { useState } from "react";
import { RecipeForm } from "@/components/RecipeForm";
import { ImportUrlBlock, type ImportedFormData } from "@/components/ImportUrlBlock";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function NewRecipePage() {
  const { isAuthenticated } = useAuth();
  const [importedData, setImportedData] = useState<ImportedFormData | null>(null);
  // key forces RecipeForm to re-mount (and re-initialize state) after each import
  const [formKey, setFormKey] = useState(0);

  function handleImport(data: ImportedFormData) {
    setImportedData(data);
    setFormKey((k) => k + 1);
  }

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
      {isAuthenticated && (
        <ImportUrlBlock onImport={handleImport} />
      )}
      <RecipeForm key={formKey} initialData={importedData ?? undefined} />
    </>
  );
}
