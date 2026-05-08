const PROD_URL = "https://recipe-book-holy-dew-1625.fly.dev";
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error("ADMIN_PASSWORD env var is required");
  process.exit(1);
}

const recipes = [
  {
    title: "Korean Steamed Egg (Gyeran-jjim)",
    description:
      "Silky, custard-soft steamed eggs with a mild savoury flavour — one of the easiest Korean dishes and a great finger food for toddlers.",
    ingredients: [
      { name: "eggs", quantity: "3", unit: null, notes: null },
      { name: "water", quantity: "180", unit: "ml", notes: "or unsalted stock for more flavour" },
      { name: "spring onion", quantity: "1", unit: "stalk", notes: "finely chopped, optional" },
      { name: "sesame oil", quantity: "1/2", unit: "tsp", notes: null },
      { name: "low-sodium soy sauce", quantity: "1/4", unit: "tsp", notes: "optional" },
    ],
    instructions: [
      { stepNumber: 1, text: "Whisk eggs with water until fully combined. Add soy sauce if using and stir." },
      { stepNumber: 2, text: "Strain the egg mixture through a fine sieve into a small heat-proof bowl or clay pot to remove bubbles." },
      { stepNumber: 3, text: "Place the bowl in a steamer over medium-low heat. Cover and steam for 12–15 minutes until just set — the centre should wobble slightly." },
      { stepNumber: 4, text: "Drizzle with sesame oil and scatter spring onion on top. Serve immediately with rice." },
    ],
    tags: ["korean", "toddler-friendly", "egg", "steamed", "quick"],
  },
  {
    title: "Japchae (Korean Glass Noodles with Vegetables)",
    description:
      "Chewy sweet-potato glass noodles tossed with colourful stir-fried vegetables in a lightly seasoned sauce. Naturally gluten-free and easy for toddlers to self-feed.",
    ingredients: [
      { name: "sweet potato glass noodles (dangmyeon)", quantity: "100", unit: "g", notes: "available at Korean or Japanese supermarkets in HK" },
      { name: "spinach", quantity: "100", unit: "g", notes: "blanched and squeezed dry" },
      { name: "carrot", quantity: "1/2", unit: null, notes: "julienned" },
      { name: "shiitake mushrooms", quantity: "3", unit: null, notes: "stems removed, thinly sliced" },
      { name: "egg", quantity: "1", unit: null, notes: "for garnish, optional" },
      { name: "low-sodium soy sauce", quantity: "1", unit: "tbsp", notes: null },
      { name: "sesame oil", quantity: "1", unit: "tsp", notes: null },
      { name: "sugar", quantity: "1/2", unit: "tsp", notes: null },
      { name: "garlic", quantity: "1", unit: "clove", notes: "minced" },
      { name: "neutral oil", quantity: "1", unit: "tsp", notes: null },
    ],
    instructions: [
      { stepNumber: 1, text: "Cook the glass noodles in boiling water for 6–7 minutes until tender. Drain, rinse under cold water, and cut into shorter lengths with scissors for toddlers." },
      { stepNumber: 2, text: "Mix soy sauce, sesame oil, sugar, and garlic to make the sauce." },
      { stepNumber: 3, text: "Heat oil in a pan over medium heat. Stir-fry carrots for 2 minutes, add mushrooms and cook another 2 minutes." },
      { stepNumber: 4, text: "Add noodles and spinach to the pan, pour over the sauce, and toss everything together for 2 minutes." },
      { stepNumber: 5, text: "If using an egg garnish, make a thin omelette, slice into strips, and lay on top before serving." },
    ],
    tags: ["korean", "toddler-friendly", "noodles", "vegetable", "gluten-free"],
  },
  {
    title: "Doenjang Soup with Tofu and Zucchini",
    description:
      "A mild, wholesome Korean fermented soybean paste soup packed with soft tofu, zucchini, and mushrooms. Use only a small amount of doenjang to keep sodium low.",
    ingredients: [
      { name: "doenjang (Korean fermented soybean paste)", quantity: "1", unit: "tsp", notes: "use sparingly to keep sodium low; available at Korean supermarkets in HK" },
      { name: "soft tofu", quantity: "150", unit: "g", notes: "cut into small cubes" },
      { name: "zucchini", quantity: "1/2", unit: null, notes: "sliced into half-moons" },
      { name: "shiitake or button mushrooms", quantity: "3", unit: null, notes: "sliced" },
      { name: "water", quantity: "500", unit: "ml", notes: "or unsalted dashida / anchovy stock" },
      { name: "garlic", quantity: "1", unit: "clove", notes: "minced" },
    ],
    instructions: [
      { stepNumber: 1, text: "Bring water to a boil in a small pot. Dissolve doenjang by pressing it through a fine strainer into the pot." },
      { stepNumber: 2, text: "Add garlic, zucchini, and mushrooms. Simmer for 5 minutes." },
      { stepNumber: 3, text: "Gently add the tofu cubes and simmer for a further 3 minutes. Taste and adjust — avoid adding more salt for toddlers." },
      { stepNumber: 4, text: "Ladle into bowls and serve with steamed rice." },
    ],
    tags: ["korean", "toddler-friendly", "soup", "tofu", "vegetable"],
  },
  {
    title: "Oyakodon (Japanese Chicken and Egg Rice Bowl)",
    description:
      "Tender chicken thigh simmered with onion in a lightly sweetened dashi broth, finished with egg. Served over rice — a comforting one-bowl meal that most toddlers love.",
    ingredients: [
      { name: "chicken thigh", quantity: "150", unit: "g", notes: "skinless, cut into small bite-sized pieces" },
      { name: "onion", quantity: "1/2", unit: null, notes: "thinly sliced" },
      { name: "eggs", quantity: "2", unit: null, notes: "lightly beaten" },
      { name: "dashi stock", quantity: "120", unit: "ml", notes: "or unsalted chicken stock" },
      { name: "low-sodium soy sauce", quantity: "1", unit: "tbsp", notes: null },
      { name: "mirin", quantity: "1", unit: "tbsp", notes: null },
      { name: "sugar", quantity: "1/2", unit: "tsp", notes: null },
      { name: "steamed rice", quantity: "1", unit: "bowl", notes: "to serve" },
    ],
    instructions: [
      { stepNumber: 1, text: "Combine dashi, soy sauce, mirin, and sugar in a small wide pan. Bring to a simmer." },
      { stepNumber: 2, text: "Add onion slices and cook for 3 minutes until softened." },
      { stepNumber: 3, text: "Add chicken pieces in a single layer. Cover and cook over medium heat for 5 minutes until cooked through." },
      { stepNumber: 4, text: "Pour beaten egg evenly over the chicken. Cover and cook on low heat for 1–2 minutes until the egg is just set but still a little creamy." },
      { stepNumber: 5, text: "Slide over a bowl of warm rice and serve immediately. Cut chicken into smaller pieces for younger toddlers." },
    ],
    tags: ["japanese", "toddler-friendly", "chicken", "egg", "rice", "one-bowl"],
  },
  {
    title: "Korean Pumpkin Porridge (Hobakjuk)",
    description:
      "Naturally sweet kabocha pumpkin porridge thickened with rice flour — creamy, smooth, and deeply nourishing. A classic Korean comfort food that toddlers adore.",
    ingredients: [
      { name: "kabocha (Japanese pumpkin)", quantity: "300", unit: "g", notes: "peeled and cubed; widely available in HK supermarkets" },
      { name: "glutinous rice flour", quantity: "3", unit: "tbsp", notes: null },
      { name: "water", quantity: "400", unit: "ml", notes: null },
      { name: "salt", quantity: "1", unit: "pinch", notes: "optional" },
      { name: "honey or brown sugar", quantity: "1", unit: "tsp", notes: "optional, pumpkin is naturally sweet" },
    ],
    instructions: [
      { stepNumber: 1, text: "Steam or boil pumpkin until very soft, about 15 minutes. Drain and mash or blend until smooth." },
      { stepNumber: 2, text: "Mix glutinous rice flour with 4 tbsp of cold water to form a smooth slurry." },
      { stepNumber: 3, text: "Combine pumpkin puree with 400 ml water in a pot over medium-low heat. Stir until smooth and heated through." },
      { stepNumber: 4, text: "Stir in the rice flour slurry and cook, stirring constantly, for 5 minutes until thickened. Season with a tiny pinch of salt and honey if needed." },
      { stepNumber: 5, text: "Serve warm in a bowl. It keeps well in the fridge for 2 days; reheat with a splash of water." },
    ],
    tags: ["korean", "toddler-friendly", "pumpkin", "porridge", "vegan", "gluten-free"],
  },
  {
    title: "Korean Spinach Side Dish (Sigeumchi Namul)",
    description:
      "Blanched spinach seasoned with sesame oil, garlic, and a touch of soy sauce. A classic Korean banchan that takes 10 minutes and is packed with iron and vitamins.",
    ingredients: [
      { name: "spinach", quantity: "200", unit: "g", notes: "washed" },
      { name: "garlic", quantity: "1", unit: "clove", notes: "minced" },
      { name: "sesame oil", quantity: "1", unit: "tsp", notes: null },
      { name: "low-sodium soy sauce", quantity: "1/2", unit: "tsp", notes: null },
      { name: "toasted sesame seeds", quantity: "1/2", unit: "tsp", notes: "optional" },
    ],
    instructions: [
      { stepNumber: 1, text: "Bring a large pot of water to a boil. Add spinach and blanch for 30 seconds." },
      { stepNumber: 2, text: "Drain and immediately transfer to a bowl of cold water. Drain again and squeeze firmly to remove as much water as possible." },
      { stepNumber: 3, text: "Roughly chop the spinach and place in a bowl." },
      { stepNumber: 4, text: "Add garlic, sesame oil, and soy sauce. Toss to combine. Top with sesame seeds if using." },
      { stepNumber: 5, text: "Serve as a side alongside rice and other dishes. Refrigerate leftovers for up to 2 days." },
    ],
    tags: ["korean", "toddler-friendly", "spinach", "side dish", "vegetable", "quick", "vegan"],
  },
  {
    title: "Cantonese Congee with Minced Pork (Jook)",
    description:
      "Silky slow-cooked rice porridge with tender minced pork and ginger — a Hong Kong staple that's supremely easy to digest and perfect for toddlers at any meal.",
    ingredients: [
      { name: "jasmine rice", quantity: "80", unit: "g", notes: "rinsed" },
      { name: "water or unsalted chicken stock", quantity: "1", unit: "litre", notes: null },
      { name: "minced pork", quantity: "100", unit: "g", notes: null },
      { name: "ginger", quantity: "3", unit: "slices", notes: "peeled" },
      { name: "spring onion", quantity: "1", unit: "stalk", notes: "finely sliced, for serving" },
      { name: "low-sodium soy sauce", quantity: "1/2", unit: "tsp", notes: "optional, for the pork marinade" },
      { name: "sesame oil", quantity: "1/4", unit: "tsp", notes: "optional, for the pork marinade" },
    ],
    instructions: [
      { stepNumber: 1, text: "Mix minced pork with soy sauce and sesame oil (if using) and set aside to marinate for 10 minutes." },
      { stepNumber: 2, text: "Combine rice, water/stock, and ginger in a pot. Bring to a boil, then reduce heat to the lowest setting." },
      { stepNumber: 3, text: "Simmer uncovered, stirring occasionally, for 45–60 minutes until the rice completely breaks down into a thick, silky porridge. Add more water if it gets too thick." },
      { stepNumber: 4, text: "Stir in the minced pork and break up any clumps. Cook for a further 3–5 minutes until pork is cooked through." },
      { stepNumber: 5, text: "Remove ginger slices. Ladle into bowls and top with spring onion. For babies under 1, skip the soy sauce and sesame oil." },
    ],
    tags: ["cantonese", "hong kong", "toddler-friendly", "porridge", "pork", "congee"],
  },
  {
    title: "Soft Tofu Soup with Egg (Mild Sundubu-jjigae)",
    description:
      "A gentle, non-spicy version of the Korean soft tofu stew — just tender silken tofu simmered in a mild anchovy broth with an egg cracked in at the end.",
    ingredients: [
      { name: "silken soft tofu", quantity: "200", unit: "g", notes: "use the smooth block type" },
      { name: "egg", quantity: "1", unit: null, notes: null },
      { name: "dried anchovies", quantity: "6", unit: null, notes: "or use unsalted chicken/vegetable stock instead" },
      { name: "dried wakame seaweed", quantity: "1", unit: "tsp", notes: "rehydrated in water; optional" },
      { name: "garlic", quantity: "1", unit: "clove", notes: "minced" },
      { name: "low-sodium soy sauce", quantity: "1/2", unit: "tsp", notes: null },
      { name: "water", quantity: "300", unit: "ml", notes: null },
    ],
    instructions: [
      { stepNumber: 1, text: "Make a simple anchovy stock: simmer anchovies in 300 ml water for 10 minutes, then remove anchovies. (Skip this step if using ready-made stock.)" },
      { stepNumber: 2, text: "Add garlic and rehydrated wakame to the stock. Bring to a gentle simmer." },
      { stepNumber: 3, text: "Spoon the tofu in large chunks directly into the pot. Simmer for 3 minutes — do not stir, just let it warm through." },
      { stepNumber: 4, text: "Crack the egg into the centre, cover, and cook for 2 minutes until the white is just set." },
      { stepNumber: 5, text: "Add soy sauce and taste. Serve immediately in the pot or ladle into bowls over rice." },
    ],
    tags: ["korean", "toddler-friendly", "tofu", "soup", "egg", "quick"],
  },
  {
    title: "Toddler Bibimbap",
    description:
      "A simplified version of the Korean mixed rice bowl with stir-fried vegetables and a fried egg. Skip the gochujang entirely or use the tiniest smear for adventurous toddlers.",
    ingredients: [
      { name: "steamed short-grain rice", quantity: "1", unit: "bowl", notes: null },
      { name: "carrot", quantity: "1/3", unit: null, notes: "julienned" },
      { name: "zucchini", quantity: "1/3", unit: null, notes: "julienned" },
      { name: "spinach", quantity: "60", unit: "g", notes: "blanched and squeezed dry" },
      { name: "egg", quantity: "1", unit: null, notes: null },
      { name: "sesame oil", quantity: "1", unit: "tsp", notes: null },
      { name: "low-sodium soy sauce", quantity: "1/2", unit: "tsp", notes: null },
      { name: "neutral oil", quantity: "1", unit: "tsp", notes: null },
    ],
    instructions: [
      { stepNumber: 1, text: "Stir-fry carrot in a little oil over medium heat for 2 minutes, then set aside. Repeat with zucchini (2 minutes). Season spinach with a tiny drop of sesame oil." },
      { stepNumber: 2, text: "Fry the egg sunny-side-up in the same pan until the white is set. For younger toddlers, cook the yolk fully." },
      { stepNumber: 3, text: "Place rice in a wide bowl. Arrange vegetables neatly on top, place the egg in the centre." },
      { stepNumber: 4, text: "Drizzle sesame oil and soy sauce over everything. Mix thoroughly before serving to toddlers — break the egg yolk and stir everything together." },
    ],
    tags: ["korean", "toddler-friendly", "rice", "vegetable", "egg", "one-bowl"],
  },
  {
    title: "Cantonese Steamed Fish with Ginger",
    description:
      "Whole fish or fillets steamed to perfection with ginger and spring onion, finished with a small pour of hot oil and soy sauce. A classic HK dish that is lean, protein-rich, and very mild.",
    ingredients: [
      { name: "white fish fillet", quantity: "200", unit: "g", notes: "sea bass, tilapia, or cod — all widely available in HK wet markets" },
      { name: "ginger", quantity: "4", unit: "slices", notes: "peeled, cut into fine matchsticks" },
      { name: "spring onion", quantity: "2", unit: "stalks", notes: "cut into 5 cm lengths" },
      { name: "low-sodium soy sauce", quantity: "1", unit: "tbsp", notes: null },
      { name: "neutral oil", quantity: "1", unit: "tbsp", notes: "for the finishing pour" },
      { name: "sugar", quantity: "1/4", unit: "tsp", notes: "stir into the soy sauce" },
    ],
    instructions: [
      { stepNumber: 1, text: "Pat fish dry. Lay half the ginger and spring onion on a heatproof plate. Place fish on top and scatter remaining ginger and spring onion over the fish." },
      { stepNumber: 2, text: "Set up a steamer and bring water to a vigorous boil. Steam the fish for 8–10 minutes per 2.5 cm of thickness — it's done when flesh flakes easily with a fork." },
      { stepNumber: 3, text: "Mix soy sauce with sugar and pour over the steamed fish." },
      { stepNumber: 4, text: "Heat oil in a small pan until just smoking. Pour over the fish — it will sizzle and fragrant. Serve immediately with steamed rice, breaking fish into flakes for toddlers and checking for bones." },
    ],
    tags: ["cantonese", "hong kong", "toddler-friendly", "fish", "steamed", "protein"],
  },
];

async function postRecipe(recipe) {
  const res = await fetch(`${PROD_URL}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PASSWORD}`,
    },
    body: JSON.stringify(recipe),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} for "${recipe.title}": ${body}`);
  }

  return res.json();
}

console.log(`Seeding ${recipes.length} recipes to ${PROD_URL}...`);

for (const recipe of recipes) {
  const created = await postRecipe(recipe);
  console.log(`  ✓ ${created.title}`);
}

console.log("Done.");
