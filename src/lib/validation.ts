import { Ingredient } from "./ingredients";

export interface Instruction {
  stepNumber: number;
  text: string;
}

export interface RecipeInput {
  title?: string;
  description?: string;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  tags?: string[];
}

export function validateRecipeCreate(data: RecipeInput): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!data.ingredients || data.ingredients.length === 0) {
    errors.push("At least one ingredient is required");
  } else {
    for (let i = 0; i < data.ingredients.length; i++) {
      if (!data.ingredients[i].name?.trim()) {
        errors.push(`Ingredient ${i + 1} must have a name`);
      }
    }
  }

  if (!data.instructions || data.instructions.length === 0) {
    errors.push("At least one instruction step is required");
  } else {
    for (let i = 0; i < data.instructions.length; i++) {
      if (!data.instructions[i].text?.trim()) {
        errors.push(`Instruction step ${i + 1} must have text`);
      }
    }
  }

  return errors;
}
