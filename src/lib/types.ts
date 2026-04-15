import { Ingredient } from "./ingredients";
import { Instruction } from "./validation";

export interface RecipePhoto {
  id: string;
  url: string;
  alt: string | null;
}

export interface RecipeListItem {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  photos: RecipePhoto[];
  createdAt: string;
  updatedAt: string;
}
