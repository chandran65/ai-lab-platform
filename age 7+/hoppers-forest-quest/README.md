# Hopper's Forest Quest

An interactive Python learning game for kids aged 7–11. Guide Hopper the bunny through a forest by writing real Python code!

## How to play

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox).
2. Read Sage the owl's tips in the speech bubble.
3. Click **Watch demo** to learn each line of code step by step.
4. Type your Python in the editor and click **Run my code**.
5. Use **Reset Hopper** to try the same level again.
6. Use **Previous level** to go back and replay an earlier level.

## Commands you can use

```python
hopper.move(steps=3)   # Move forward 3 squares
hopper.turn(90)        # Turn right (clockwise)
hopper.turn(-90)       # Turn left

for i in range(4):     # Repeat 4 times
    hopper.move(steps=2)
```

## Levels

1. **Say hello to hopping** — basic `move()`
2. **Turn the corner** — `turn()` around obstacles
3. **Repeat with a loop** — `for` loops
4. **Forest maze** — combine moves and turns
5. **Loop master** — zigzag path (loop optional, walls block shortcuts)
6. **The long detour** — navigate around a blocked path
7. **Square patrol** — zigzag twice with a for loop (walls block shortcuts)
8. **Rocky path** — weaving through obstacles
9. **Loop then leap** — code after a loop finishes the path
10. **Forest champion** — final maze with loops and walls

## Sound effects

Hop, turn, wall bonk, victory, and error sounds play automatically. Use the **Sound on/off** toggle in the code panel to mute them.

## Run locally (optional)

Any static file server works:

```bash
npx serve .
```

Or double-click `index.html`.

No install or backend required — everything runs in the browser.
