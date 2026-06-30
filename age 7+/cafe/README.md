# Pet Café Builder 🐾

A browser-based coding game that teaches **functions, parameters, return values, and debugging** to kids aged 7–11 through café simulation.

## How to run

Open `index.html` in any modern browser. No build step, no server required (though you can host it with any static web server).

## How it works

1. A cute animal customer walks into the café and places an order.
2. A **recipe card** (code editor) appears showing the function needed to make that order — e.g. `make_smoothie(fruit, ice)`.
3. Hovering or tapping a line of code highlights an annotation explaining what that line does in the kitchen.
4. The child fills in blanks (parameters) and hits **"Cook It!"**
5. Correct code → happy customer animation + coins + café decoration unlock.
   Incorrect code → a funny visual fail (explosion, sour face, etc.) and a chance to retry.

## Concepts taught, level by level

| Level | Title | Concept |
|---|---|---|
| 1 | The First Smoothie | Functions & parameters |
| 2 | The Cozy Cookie | Return values |
| 3 | The Super Shake | Calling functions inside functions |
| 4 | Debug the Lemonade! | Debugging a broken recipe |

## File structure

```
pet-cafe/
├── index.html        Main page shell
├── css/
│   └── style.css      Café theming, animations, layout
├── js/
│   ├── levels.js       All level/recipe/decoration data
│   ├── editor.js       Block-based recipe code editor
│   └── game.js         Game loop, customer logic, coins, shop, save system
└── README.md
```

## Customizing / extending

- **Add a new level:** add an object to the `LEVELS` array in `js/levels.js` following the existing shape (customer, recipe steps, blanks, fail message, coins).
- **Add a decoration:** add an object to `DECORATIONS` in `js/levels.js`.
- Progress (coins, completed levels, decorations) is saved to `localStorage` automatically, so kids can close the tab and resume later.

## Design notes

- Built mobile-first and responsive (single column under 640px).
- Code editor uses a dark "kitchen recipe card" syntax-highlighted look to make code feel approachable, not intimidating.
- All animations are CSS-based for performance; no external game engine.
