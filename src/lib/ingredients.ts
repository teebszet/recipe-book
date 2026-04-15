export interface Ingredient {
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
}

export function normaliseIngredient(ingredient: Ingredient): Ingredient {
  return {
    name: ingredient.name.trim().toLowerCase(),
    quantity: ingredient.quantity?.trim() || null,
    unit: ingredient.unit?.trim().toLowerCase() || null,
    notes: ingredient.notes?.trim() || null,
  };
}

export function normaliseIngredients(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.map(normaliseIngredient);
}
