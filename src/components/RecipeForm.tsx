"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  notes: string;
}

interface Instruction {
  stepNumber: number;
  text: string;
}

interface ExistingPhoto {
  id: string;
  url: string;
  alt: string | null;
}

interface RecipeFormProps {
  recipeId?: string;
  initialData?: {
    title: string;
    description: string;
    ingredients: Ingredient[];
    instructions: Instruction[];
    tags: string[];
    photos?: ExistingPhoto[];
  };
}

const emptyIngredient = (): Ingredient => ({
  name: "",
  quantity: "",
  unit: "",
  notes: "",
});

const emptyInstruction = (step: number): Instruction => ({
  stepNumber: step,
  text: "",
});

export function RecipeForm({ recipeId, initialData }: RecipeFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients.length
      ? initialData.ingredients
      : [emptyIngredient()]
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    initialData?.instructions.length
      ? initialData.instructions
      : [emptyInstruction(1)]
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    initialData?.photos || []
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);
  const instructionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    if (tagInput.length < 1) {
      setTagSuggestions([]);
      return;
    }
    fetch(`/api/tags?q=${encodeURIComponent(tagInput)}`)
      .then((r) => r.json())
      .then((data) =>
        setTagSuggestions(
          (data.tags || []).filter((t: string) => !tags.includes(t))
        )
      )
      .catch(() => setTagSuggestions([]));
  }, [tagInput, tags]);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, emptyIngredient()]);
    // Focus new row's name field after render
    setTimeout(() => {
      const refs = ingredientRefs.current;
      const last = refs[refs.length - 1];
      if (last) last.focus();
    }, 0);
  }, []);

  function removeIngredient(index: number) {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  function moveIngredient(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ingredients.length) return;
    const updated = [...ingredients];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setIngredients(updated);
  }

  function handleIngredientKeyDown(
    e: React.KeyboardEvent,
    index: number
  ) {
    if (e.key === "Enter" && index === ingredients.length - 1) {
      e.preventDefault();
      addIngredient();
    }
  }

  const addInstruction = useCallback(() => {
    setInstructions((prev) => [
      ...prev,
      emptyInstruction(prev.length + 1),
    ]);
    setTimeout(() => {
      const refs = instructionRefs.current;
      const last = refs[refs.length - 1];
      if (last) last.focus();
    }, 0);
  }, []);

  function removeInstruction(index: number) {
    if (instructions.length <= 1) return;
    const updated = instructions
      .filter((_, i) => i !== index)
      .map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
    setInstructions(updated);
  }

  function updateInstruction(index: number, text: string) {
    const updated = [...instructions];
    updated[index] = { ...updated[index], text };
    setInstructions(updated);
  }

  function moveInstruction(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= instructions.length) return;
    const updated = [...instructions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setInstructions(
      updated.map((inst, i) => ({ ...inst, stepNumber: i + 1 }))
    );
  }

  function handleInstructionKeyDown(
    e: React.KeyboardEvent,
    index: number
  ) {
    if (
      e.key === "Enter" &&
      e.shiftKey &&
      index === instructions.length - 1
    ) {
      e.preventDefault();
      addInstruction();
    }
  }

  function addTag(tag: string) {
    const normalised = tag.trim().toLowerCase();
    if (normalised && !tags.includes(normalised)) {
      setTags([...tags, normalised]);
    }
    setTagInput("");
    setTagSuggestions([]);
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (recipeId) {
      // Upload immediately for existing recipes
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiFetch(`/api/recipes/${recipeId}/photos`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const photo = await res.json();
          setExistingPhotos((prev) => [...prev, photo]);
        }
      }
    } else {
      setPhotos((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
    // Reset file input
    e.target.value = "";
  }

  async function removeExistingPhoto(photoId: string) {
    const res = await apiFetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (res.ok) {
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    // Include any pending tag that wasn't confirmed with Enter
    const finalTags = [...tags];
    if (tagInput.trim()) {
      const pending = tagInput.trim().toLowerCase();
      if (!finalTags.includes(pending)) {
        finalTags.push(pending);
      }
    }

    const body = {
      title,
      description: description || undefined,
      ingredients: ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        notes: ing.notes || null,
      })),
      instructions,
      tags: finalTags,
    };

    const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
    const method = recipeId ? "PUT" : "POST";

    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setErrors(data.errors || [data.error || "Failed to save"]);
      setSaving(false);
      return;
    }

    const recipe = await res.json();

    // Upload photos for new recipes
    if (!recipeId && photos.length > 0) {
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);
        await apiFetch(`/api/recipes/${recipe.id}/photos`, {
          method: "POST",
          body: formData,
        });
      }
    }

    router.push(`/recipes/${recipe.id}`);
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline focus:bg-white focus:outline-none focus:ring-1 focus:ring-outline/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {errors.length > 0 && (
        <div className="bg-error/10 rounded-lg p-4">
          {errors.map((err, i) => (
            <p key={i} className="text-error text-sm">
              {err}
            </p>
          ))}
        </div>
      )}

      <div>
        <label className="block font-serif text-lg text-on-surface mb-2">
          Title <span className="text-error text-sm">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe name"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block font-serif text-lg text-on-surface mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description (optional)"
          rows={2}
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-serif text-lg text-on-surface">
            Ingredients <span className="text-error text-sm">*</span>
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-primary font-medium"
          >
            + Add ingredient
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Press Enter on the last row to add another
        </p>
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 items-start flex-1 min-w-0">
                <input
                  ref={(el) => { ingredientRefs.current[i] = el; }}
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(e, i)}
                  placeholder="Ingredient name"
                  className={`flex-[3] min-w-0 ${inputClass}`}
                />
              </div>
              <div className="flex gap-2 items-start">
                <input
                  type="text"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(e, i)}
                  placeholder="Qty"
                  className={`w-20 ${inputClass}`}
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(e, i)}
                  placeholder="Unit"
                  className={`w-20 ${inputClass}`}
                />
                <input
                  type="text"
                  value={ing.notes}
                  onChange={(e) => updateIngredient(i, "notes", e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(e, i)}
                  placeholder="Notes"
                  className={`w-28 sm:w-32 ${inputClass}`}
                />
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => moveIngredient(i, -1)}
                    disabled={i === 0}
                    className="text-on-surface-variant disabled:opacity-30 text-sm"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveIngredient(i, 1)}
                    disabled={i === ingredients.length - 1}
                    className="text-on-surface-variant disabled:opacity-30 text-sm"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-error text-lg px-1 mt-3"
                    aria-label="Remove ingredient"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-serif text-lg text-on-surface">
            Instructions <span className="text-error text-sm">*</span>
          </label>
          <button
            type="button"
            onClick={addInstruction}
            className="text-sm text-primary font-medium"
          >
            + Add step
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Press Shift+Enter on the last step to add another
        </p>
        <div className="space-y-3">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-8 h-8 mt-3 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-medium text-on-surface-variant">
                {step.stepNumber}
              </span>
              <textarea
                ref={(el) => { instructionRefs.current[i] = el; }}
                value={step.text}
                onChange={(e) => updateInstruction(i, e.target.value)}
                onKeyDown={(e) => handleInstructionKeyDown(e, i)}
                placeholder={`Step ${step.stepNumber}`}
                rows={2}
                className={`flex-1 ${inputClass}`}
              />
              <div className="flex flex-col gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => moveInstruction(i, -1)}
                  disabled={i === 0}
                  className="text-on-surface-variant disabled:opacity-30 text-sm"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveInstruction(i, 1)}
                  disabled={i === instructions.length - 1}
                  className="text-on-surface-variant disabled:opacity-30 text-sm"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  className="text-error text-lg px-2 mt-3"
                  aria-label="Remove step"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-serif text-lg text-on-surface mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-secondary text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-secondary/60 hover:text-secondary"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add a tag..."
            className={inputClass}
          />
          {tagSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-[0_8px_24px_rgba(29,28,24,0.1)] z-10">
              {tagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="block w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block font-serif text-lg text-on-surface mb-2">
          Photos
        </label>
        {existingPhotos.length > 0 && (
          <div className="flex gap-3 mb-3 flex-wrap">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.url}
                  alt={photo.alt || "Recipe photo"}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(photo.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center text-xs leading-none"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoChange}
          className="text-sm text-on-surface-variant"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          JPEG, PNG, or WebP — max 10MB
        </p>
        {previews.length > 0 && (
          <div className="flex gap-3 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Preview ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 rounded-[0.75rem] bg-primary text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : recipeId ? "Update Recipe" : "Save Recipe"}
      </button>
    </form>
  );
}
