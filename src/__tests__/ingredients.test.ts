import {
  normaliseIngredient,
  normaliseIngredients,
  Ingredient,
} from "@/lib/ingredients";

describe("normaliseIngredient", () => {
  it("lowercases ingredient name", () => {
    const input: Ingredient = {
      name: "Parmigiano Reggiano",
      quantity: "200",
      unit: "g",
      notes: "finely grated",
    };
    const result = normaliseIngredient(input);
    expect(result.name).toBe("parmigiano reggiano");
  });

  it("trims whitespace from all fields", () => {
    const input: Ingredient = {
      name: "  chicken  ",
      quantity: " 500 ",
      unit: " g ",
      notes: " diced ",
    };
    const result = normaliseIngredient(input);
    expect(result.name).toBe("chicken");
    expect(result.quantity).toBe("500");
    expect(result.unit).toBe("g");
    expect(result.notes).toBe("diced");
  });

  it("converts empty strings to null", () => {
    const input: Ingredient = {
      name: "salt",
      quantity: "",
      unit: "",
      notes: "",
    };
    const result = normaliseIngredient(input);
    expect(result.name).toBe("salt");
    expect(result.quantity).toBeNull();
    expect(result.unit).toBeNull();
    expect(result.notes).toBeNull();
  });

  it("handles null optional fields", () => {
    const input: Ingredient = {
      name: "Salt",
      quantity: null,
      unit: null,
      notes: null,
    };
    const result = normaliseIngredient(input);
    expect(result).toEqual({
      name: "salt",
      quantity: null,
      unit: null,
      notes: null,
    });
  });
});

describe("normaliseIngredients", () => {
  it("normalises an array of ingredients", () => {
    const input: Ingredient[] = [
      { name: "CHICKEN", quantity: "500", unit: "G", notes: null },
      { name: "Salt", quantity: null, unit: null, notes: null },
    ];
    const result = normaliseIngredients(input);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("chicken");
    expect(result[0].unit).toBe("g");
    expect(result[1].name).toBe("salt");
  });

  it("handles empty array", () => {
    expect(normaliseIngredients([])).toEqual([]);
  });
});
