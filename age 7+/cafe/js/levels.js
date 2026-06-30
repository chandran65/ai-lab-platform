/* ============================================
   PET CAFÉ BUILDER — LEVEL / RECIPE DEFINITIONS
   ============================================
   Each level teaches one coding concept through a recipe.
   - blocks: the master list of possible ingredient strips (the tray + decoys)
   - correctOrder: array of block ids in the order they MUST appear in code body
   - params: parameter names shown in the def() line
   - requiresReturn: whether a 'return cup' line is required
   - customer/order: flavor text
============================================ */

const LEVELS = [

  // ---------- LEVEL 1: Sequencing (no params yet) ----------
  {
    id: 1,
    concept: "sequencing",
    functionName: "make_juice",
    params: [],
    requiresReturn: true,
    customer: { emoji: "🐰", name: "Bunny", line: "Hi! Can I get a juice? 🥤" },
    order: "Juice",
    blocks: [
      { id: "pour_water", icon: "💧", label: "pour(water)", tooltip: "Pours water into the cup" },
      { id: "add_orange", icon: "🍊", label: "add(orange)", tooltip: "Adds fresh orange" },
      { id: "stir", icon: "🥄", label: "stir()", tooltip: "Stirs everything together" },
      { id: "add_lemon_decoy", icon: "🍋", label: "add(lemon)", tooltip: "Adds lemon (not needed here!)", decoy: true },
    ],
    correctOrder: ["pour_water", "add_orange", "stir"],
    hint: "Recipes run top to bottom — pour first, then add fruit, then stir!",
    coinsOnSuccess: 10,
  },

  // ---------- LEVEL 2: One Parameter ----------
  {
    id: 2,
    concept: "parameters",
    functionName: "make_smoothie",
    params: ["fruit"],
    requiresReturn: true,
    customer: { emoji: "🐱", name: "Kitten", line: "I'd love a smoothie! 🍓" },
    order: "Smoothie (fruit)",
    blocks: [
      { id: "blend_fruit", icon: "🍓", label: "blend(fruit)", tooltip: "Blends the {fruit} parameter — whatever fruit was ordered!" },
      { id: "pour_cup", icon: "🥤", label: "pour_into_cup()", tooltip: "Pours the blended mix into a cup" },
      { id: "add_straw", icon: "🥢", label: "add_straw()", tooltip: "Adds a straw on top" },
      { id: "add_ice_decoy", icon: "🧊", label: "add(ice)", tooltip: "Adds ice — not part of this recipe yet!", decoy: true },
    ],
    correctOrder: ["blend_fruit", "pour_cup", "add_straw"],
    hint: "fruit is a parameter — it stands in for whatever the customer ordered. blend(fruit) must come first!",
    coinsOnSuccess: 15,
  },

  // ---------- LEVEL 3: Two Parameters ----------
  {
    id: 3,
    concept: "parameters",
    functionName: "make_smoothie",
    params: ["fruit", "ice"],
    requiresReturn: true,
    customer: { emoji: "🐻", name: "Bear", line: "Extra icy smoothie please! 🧊" },
    order: "Iced Smoothie (fruit, ice)",
    blocks: [
      { id: "blend_fruit", icon: "🍓", label: "blend(fruit)", tooltip: "Blends the fruit parameter" },
      { id: "add_ice", icon: "🧊", label: "add(ice)", tooltip: "Adds the ice parameter for extra chill" },
      { id: "pour_cup", icon: "🥤", label: "pour_into_cup()", tooltip: "Pours the mix into a cup" },
      { id: "add_straw", icon: "🥢", label: "add_straw()", tooltip: "Adds a straw on top" },
    ],
    correctOrder: ["blend_fruit", "add_ice", "pour_cup", "add_straw"],
    hint: "Two ingredients now! Blend the fruit, add the ice, THEN pour. Order matters.",
    coinsOnSuccess: 20,
  },

  // ---------- LEVEL 4: Function calling a helper function (composition) ----------
  {
    id: 4,
    concept: "function-composition",
    functionName: "make_sundae",
    params: ["topping"],
    requiresReturn: true,
    customer: { emoji: "🦊", name: "Fox", line: "Sundae time! What toppings do you have? 🍨" },
    order: "Sundae (topping)",
    blocks: [
      { id: "scoop_base", icon: "🍦", label: "make_scoop()", tooltip: "Calls another recipe — make_scoop() — to get a base scoop" },
      { id: "add_topping", icon: "🍒", label: "add(topping)", tooltip: "Adds the topping parameter on top" },
      { id: "drizzle", icon: "🍯", label: "drizzle()", tooltip: "Drizzles a little honey on top" },
      { id: "blend_fruit_decoy", icon: "🍓", label: "blend(fruit)", tooltip: "That's for smoothies, not sundaes!", decoy: true },
    ],
    correctOrder: ["scoop_base", "add_topping", "drizzle"],
    hint: "make_scoop() is a function INSIDE your function — call it first to build the base!",
    coinsOnSuccess: 25,
  },

  // ---------- LEVEL 5: Debugging (starts BROKEN, child must fix order) ----------
  {
    id: 5,
    concept: "debugging",
    functionName: "make_smoothie",
    params: ["fruit", "ice"],
    requiresReturn: true,
    customer: { emoji: "🐢", name: "Turtle", line: "Something's not right with my order... 🤔" },
    order: "Iced Smoothie (fruit, ice) — FIX THE BUG!",
    blocks: [
      { id: "blend_fruit", icon: "🍓", label: "blend(fruit)", tooltip: "Blends the fruit parameter" },
      { id: "add_ice", icon: "🧊", label: "add(ice)", tooltip: "Adds the ice parameter" },
      { id: "pour_cup", icon: "🥤", label: "pour_into_cup()", tooltip: "Pours the mix into a cup" },
      { id: "add_straw", icon: "🥢", label: "add_straw()", tooltip: "Adds a straw on top" },
    ],
    // pre-filled in WRONG order to teach debugging
    prefilled: ["pour_cup", "blend_fruit", "add_ice", "add_straw"],
    correctOrder: ["blend_fruit", "add_ice", "pour_cup", "add_straw"],
    hint: "Oops — pour_into_cup() happened before blending! Drag the lines to fix the order.",
    coinsOnSuccess: 30,
  },
];

// Café shop items unlocked at coin milestones
const SHOP_MILESTONES = [
  { coins: 50,  items: [{ emoji: "🪴", name: "Plant" }, { emoji: "🖼️", name: "Wall Art" }] },
  { coins: 120, items: [{ emoji: "🪑", name: "New Table" }, { emoji: "💡", name: "Fairy Lights" }] },
  { coins: 220, items: [{ emoji: "🎪", name: "Patio Tent" }, { emoji: "🐾", name: "Pet Bed" }] },
];
