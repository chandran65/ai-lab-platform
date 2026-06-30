# Bot Rescue Squad 🤖🚒

A browser-based coding game that teaches kids Python functions — `def`, parameters, `return`, function chaining, default values, and docstrings — through 10 disaster-rescue missions.

No build step, no dependencies. Just open `index.html` in a browser.

## File structure

```
bot-rescue-squad/
├── index.html        # Page structure & all overlays (start, intro, success, map, finale)
├── styles.css         # All visual styling — fixed-viewport layout, scene art, UI
└── js/
    ├── audio.js        # Synthesized sound effects (Web Audio API, no audio files needed)
    ├── levels.js        # All 10 level definitions: story, tutorial text, code lines, blanks, hints
    └── game.js          # Game engine: scene building, robot animation, code rendering, level flow
```

## How it plays

1. **Briefing** — each level opens with a story and a tutorial pop-up explaining one new Python concept.
2. **Code panel** — a partially-blanked function definition is shown on the right. Kids fill in the blanks by tapping word-bank buttons (Mad-Libs style), so there's no syntax frustration.
3. **Run Code** — once every blank is filled, hitting ▶ RUN CODE animates the robot walking across the scene to rescue each civilian, with sound effects and a success pop-up explaining what the code actually does.
4. **Progress** — stars and completed levels are saved to `localStorage`, with a mission map to replay or jump between unlocked levels.

## The 10 levels

| # | Level | Concept |
|---|-------|---------|
| 1 | Earthquake Alley | `def` — defining a function |
| 2 | Smoke on the Block | Parameters |
| 3 | Flooded Street | Multiple parameters |
| 4 | Mad Libs Rescue | Reusing functions with different arguments |
| 5 | Bring It Back | `return` |
| 6 | Empty-Handed Bot | Debugging a missing `return` |
| 7 | Chain Reaction | Function chaining |
| 8 | Docstring Detective | Docstrings |
| 9 | Multi-Bot Mission | Default parameter values |
| 10 | City-Wide Save | Full review — everything combined |

## Customizing

- **Add/edit levels**: edit the `LEVELS` array in `js/levels.js`. Each level has `story`, `tutorial`, `codeLines` (with `{blank: 'id'}` markers), `blanks` (correct answer + distractor options), `hint`, `civilians`, and success text.
- **Change sounds**: edit the `sfx()` function in `js/audio.js` — all effects are synthesized with oscillators, so no audio files are needed.
- **Change visuals**: edit `styles.css`. The scene (buildings, ground, robot, fx) is built dynamically in `js/game.js` via `buildScene()`.

## Browser support

Works in any modern browser. The layout is locked to the window (`100vw` / `100vh`, no scrolling) so it behaves like a fixed-size app rather than a scrolling webpage.
