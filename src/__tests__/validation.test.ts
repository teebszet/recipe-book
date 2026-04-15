import { validateRecipeCreate, RecipeInput } from "@/lib/validation";

describe("validateRecipeCreate", () => {
  it("returns no errors for valid input", () => {
    const input: RecipeInput = {
      title: "Pasta Carbonara",
      ingredients: [{ name: "Spaghetti", quantity: "400", unit: "g", notes: null }],
      instructions: [{ stepNumber: 1, text: "Boil water" }],
    };
    expect(validateRecipeCreate(input)).toEqual([]);
  });

  it("requires title", () => {
    const input: RecipeInput = {
      ingredients: [{ name: "Salt", quantity: null, unit: null, notes: null }],
      instructions: [{ stepNumber: 1, text: "Do something" }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("Title is required");
  });

  it("rejects empty title", () => {
    const input: RecipeInput = {
      title: "   ",
      ingredients: [{ name: "Salt", quantity: null, unit: null, notes: null }],
      instructions: [{ stepNumber: 1, text: "Do something" }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("Title is required");
  });

  it("requires at least one ingredient", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      ingredients: [],
      instructions: [{ stepNumber: 1, text: "Do something" }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("At least one ingredient is required");
  });

  it("requires missing ingredients array", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      instructions: [{ stepNumber: 1, text: "Do something" }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("At least one ingredient is required");
  });

  it("requires ingredient names", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      ingredients: [{ name: "", quantity: "100", unit: "g", notes: null }],
      instructions: [{ stepNumber: 1, text: "Do something" }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("Ingredient 1 must have a name");
  });

  it("requires at least one instruction", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      ingredients: [{ name: "Salt", quantity: null, unit: null, notes: null }],
      instructions: [],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("At least one instruction step is required");
  });

  it("requires missing instructions array", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      ingredients: [{ name: "Salt", quantity: null, unit: null, notes: null }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("At least one instruction step is required");
  });

  it("requires instruction text", () => {
    const input: RecipeInput = {
      title: "Test Recipe",
      ingredients: [{ name: "Salt", quantity: null, unit: null, notes: null }],
      instructions: [{ stepNumber: 1, text: "  " }],
    };
    const errors = validateRecipeCreate(input);
    expect(errors).toContain("Instruction step 1 must have text");
  });

  it("returns multiple errors at once", () => {
    const input: RecipeInput = {};
    const errors = validateRecipeCreate(input);
    expect(errors).toHaveLength(3);
    expect(errors).toContain("Title is required");
    expect(errors).toContain("At least one ingredient is required");
    expect(errors).toContain("At least one instruction step is required");
  });
});
