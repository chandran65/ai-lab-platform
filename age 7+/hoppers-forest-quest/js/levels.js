/**
 * Level definitions for Hopper's Forest Quest
 * Grid: 12x12 cells. (0,0) is top-left. Hopper direction: 0=right, 90=down, 180=left, 270=up
 */
const LEVELS = [
  {
    id: 1,
    title: "Level 1: Say hello to hopping!",
    goal: "Goal: get Hopper to the golden carrot 🥕",
    start: { x: 2, y: 5, direction: 0 },
    carrot: { x: 5, y: 5 },
    walls: [],
    starterCode: `# Move Hopper forward to reach the carrot!
hopper.move(steps=3)
`,
    demoCode: `hopper.move(steps=3)`,
    hint: "Try changing the number inside move() to see how far Hopper hops!",
    welcomeSage:
      "Welcome! Hopper needs the golden carrot. Type <strong>hopper.move(steps=3)</strong> — the number inside tells Hopper how many squares to hop forward!",
    guidanceSteps: [
      {
        title: "Your first command",
        sage:
          "Python code tells Hopper what to do. Your command is <strong>hopper.move(steps=3)</strong> — hopper is Hopper, move means go forward, and steps=3 means 3 squares.",
      },
      {
        title: "Change the number",
        sage:
          "You can change the number! <strong>hopper.move(steps=5)</strong> hops 5 squares. <strong>hopper.move(steps=1)</strong> hops just 1. Count the squares from Hopper to the carrot.",
      },
      {
        title: "Comments",
        sage:
          "Lines starting with <strong>#</strong> are comments — Python ignores them. They are notes for you, like <strong># Move Hopper forward</strong>.",
      },
      {
        title: "Run it!",
        sage:
          "When your code looks right, click <strong>Run my code</strong> and watch Hopper hop! Wrong number? Change it and run again.",
      },
    ],
  },
  {
    id: 2,
    title: "Level 2: Turn the corner!",
    goal: "Goal: hop around the tree to grab the carrot 🌲",
    start: { x: 2, y: 8, direction: 0 },
    carrot: { x: 8, y: 3 },
    walls: [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 6, y: 7 },
      { x: 7, y: 7 },
    ],
    decorations: [{ type: "tree", x: 5, y: 5 }],
    demoCode: `hopper.move(steps=2)
hopper.turn(90)
hopper.move(steps=5)`,
    hint: "hopper.turn(90) turns Hopper clockwise. Use -90 to turn the other way!",
    welcomeSage:
      "Hopper can't go straight! New commands: <strong>hopper.turn(90)</strong> turns right, <strong>hopper.turn(-90)</strong> turns left. Still use <strong>hopper.move(steps=N)</strong> to hop — type your code in the editor!",
    guidanceSteps: [
      {
        title: "You already know move()",
        sage:
          "Keep using <strong>hopper.move(steps=N)</strong> to hop forward — count the squares! Example: <strong>hopper.move(steps=2)</strong> hops 2 squares.",
      },
      {
        title: "New syntax: turn right",
        sage:
          "Type <strong>hopper.turn(90)</strong> to turn Hopper right (clockwise). The number 90 means degrees — one quarter turn.",
      },
      {
        title: "New syntax: turn left",
        sage:
          "Type <strong>hopper.turn(-90)</strong> to turn Hopper left. Notice the minus sign — that makes it go the other way!",
      },
      {
        title: "Put them together",
        sage:
          "Write one line at a time, for example:<br><strong>hopper.move(steps=2)</strong><br><strong>hopper.turn(90)</strong><br><strong>hopper.move(steps=5)</strong><br>Your numbers may differ — count the grid!",
      },
      {
        title: "Your turn!",
        sage:
          "The editor is empty — <strong>you</strong> type every line! Use <strong>hopper.move(steps=N)</strong> and <strong>hopper.turn(90)</strong> or <strong>hopper.turn(-90)</strong>, then click <strong>Run my code</strong>.",
      },
    ],
  },
  {
    id: 3,
    title: "Level 3: Repeat with a loop!",
    goal: "Goal: use a for loop to hop 4 times 🔄",
    start: { x: 1, y: 6, direction: 0 },
    carrot: { x: 9, y: 6 },
    walls: [],
    demoCode: `for i in range(4):
    hopper.move(steps=2)`,
    hint: "Loops save you from typing the same line over and over!",
    teachesConcept: "forLoop",
    conceptNudge: {
      title: "Good job!",
      celebrationText:
        "Hopper found the carrot! You solved it another way — nice thinking!",
      sage:
        "Great work — that code works! But let's also try a <strong>for loop</strong>. Instead of one long move or repeating the same line, loops are much more efficient when your code gets bigger!",
      status:
        "Use a for loop to finish this level — reset Hopper, try again, then you can move on!",
    },
    welcomeSage:
      "New syntax: <strong>for i in range(4):</strong> repeats code 4 times. On the next line (indented with 4 spaces) type <strong>hopper.move(steps=2)</strong>. Change both numbers to match the grid!",
    guidanceSteps: [
      {
        title: "Why use a loop?",
        sage:
          "Instead of typing <strong>hopper.move(steps=2)</strong> four times, a loop lets you write it once and Python repeats it!",
      },
      {
        title: "New syntax: the for line",
        sage:
          "The loop starts with <strong>for i in range(4):</strong> — the colon <strong>:</strong> at the end is required! The number 4 means repeat 4 times. Try <strong>for i in range(5):</strong> for 5 times.",
      },
      {
        title: "New rule: indentation",
        sage:
          "The line inside the loop must be indented — 4 spaces to the right (press Tab). Example:<br><strong>for i in range(4):</strong><br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>hopper.move(steps=2)</strong>",
      },
      {
        title: "What goes inside?",
        sage:
          "Put the command to repeat on the indented line: <strong>hopper.move(steps=2)</strong>. Count how many hops Hopper needs — that sets both range() and steps=.",
      },
      {
        title: "Your turn!",
        sage:
          "Type <strong>for i in range(4):</strong> then the indented <strong>hopper.move(steps=2)</strong> below it. Click <strong>Run my code</strong>!",
      },
    ],
  },
  {
    id: 4,
    title: "Level 4: Forest maze!",
    goal: "Goal: navigate the maze to the carrot 🗺️",
    start: { x: 1, y: 1, direction: 0 },
    carrot: { x: 10, y: 10 },
    walls: [
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
      { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
      { x: 9, y: 5 }, { x: 9, y: 6 }, { x: 9, y: 7 }, { x: 9, y: 8 },
      { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
    ],
    demoCode: `hopper.move(steps=2)
hopper.turn(90)
hopper.move(steps=3)
hopper.turn(-90)
hopper.move(steps=2)
hopper.turn(90)
hopper.move(steps=2)
hopper.turn(90)
hopper.move(steps=5)`,
    hint: "If Hopper hits a wall, the code stops! Plan your path carefully.",
    welcomeSage:
      "Brown squares are walls! Use <strong>hopper.move(steps=N)</strong> to go forward, <strong>hopper.turn(90)</strong> to turn right, and <strong>hopper.turn(-90)</strong> to turn left. One command per line — you type them all!",
    guidanceSteps: [
      {
        title: "Watch out for walls",
        sage:
          "If Hopper hits a brown wall, the program stops! Trace a safe path with your eyes before typing any <strong>hopper.move()</strong> or <strong>hopper.turn()</strong> lines.",
      },
      {
        title: "Go forward",
        sage:
          "Use <strong>hopper.move(steps=N)</strong> for each straight section. Count squares carefully — e.g. <strong>hopper.move(steps=2)</strong> then <strong>hopper.move(steps=3)</strong> for two different straight bits.",
      },
      {
        title: "Turn at corners",
        sage:
          "At each corner type <strong>hopper.turn(90)</strong> to turn right or <strong>hopper.turn(-90)</strong> to turn left. Always turn before moving in a new direction!",
      },
      {
        title: "Use the ghost trail",
        sage:
          "As you type, the green dotted line previews Hopper's path. If it hits a wall, fix your <strong>hopper.move(steps=N)</strong> or <strong>hopper.turn()</strong> numbers.",
      },
      {
        title: "Your turn!",
        sage:
          "Plan the full maze path, then type every line yourself — only <strong>hopper.move(steps=N)</strong>, <strong>hopper.turn(90)</strong>, and <strong>hopper.turn(-90)</strong>. No loops needed here!",
      },
    ],
  },
  {
    id: 5,
    title: "Level 5: Loop master!",
    goal: "Goal: climb the zigzag path to the carrot ⛰️",
    start: { x: 1, y: 8, direction: 0 },
    carrot: { x: 10, y: 2 },
    walls: [
      { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 },
      { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 1, y: 7 }, { x: 1, y: 6 }, { x: 1, y: 5 }, { x: 1, y: 4 }, { x: 1, y: 3 },
      { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 7, y: 3 },
      { x: 8, y: 2 }, { x: 9, y: 2 },
    ],
    demoCode: `for i in range(3):
    hopper.move(steps=3)
    hopper.turn(-90)
    hopper.move(steps=2)
    hopper.turn(90)`,
    hint: "A for loop is optional — but it makes the zigzag pattern much shorter to write!",
    welcomeSage:
      "Walls block shortcuts — you must climb the <strong>zigzag</strong>! Type each move and turn yourself, or use a <strong>for loop</strong> to repeat the pattern:<br><strong>for i in range(3):</strong> then indent move, turn, move, turn.",
    guidanceSteps: [
      {
        title: "Walls block shortcuts",
        sage:
          "Brown walls mean you can't cut across — trace the zigzag with your eyes first! Hop right, turn left, hop up, turn right… and repeat.",
      },
      {
        title: "Option A: type each step",
        sage:
          "You can write every command yourself:<br><strong>hopper.move(steps=3)</strong><br><strong>hopper.turn(-90)</strong><br><strong>hopper.move(steps=2)</strong><br><strong>hopper.turn(90)</strong><br>Repeat that pattern three times!",
      },
      {
        title: "Option B: use a for loop",
        sage:
          "Or wrap the pattern in a loop: <strong>for i in range(3):</strong> then indent those four lines — much shorter for long paths!",
      },
      {
        title: "What each line does",
        sage:
          "<strong>hopper.move(steps=3)</strong> — go forward.<br><strong>hopper.turn(-90)</strong> — turn left.<br><strong>hopper.move(steps=2)</strong> — go forward again.<br><strong>hopper.turn(90)</strong> — turn back to face right.",
      },
      {
        title: "Your turn!",
        sage:
          "Pick either way — manual moves or a for loop. Both are real Python! Click <strong>Run my code</strong> when your zigzag reaches the carrot.",
      },
    ],
  },
  {
    id: 6,
    title: "Level 6: The long detour!",
    goal: "Goal: go around the fallen log to reach the carrot 🪵",
    start: { x: 1, y: 6, direction: 0 },
    carrot: { x: 10, y: 3 },
    walls: [
      { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 5, y: 8 },
    ],
    decorations: [{ type: "tree", x: 5, y: 6 }],
    demoCode: `hopper.move(steps=3)
hopper.turn(-90)
hopper.move(steps=3)
hopper.turn(90)
hopper.move(steps=6)`,
    hint: "When the path is blocked, turn and find a way around!",
    welcomeSage:
      "A fallen log blocks the straight path! Plan a detour: use <strong>hopper.move(steps=N)</strong>, then <strong>hopper.turn(-90)</strong> or <strong>hopper.turn(90)</strong> to go around it.",
    guidanceSteps: [
      {
        title: "Scout the path",
        sage:
          "Trace Hopper's route with your finger first! The brown wall blocks going straight — you must go <strong>up and around</strong>.",
      },
      {
        title: "Hop before the wall",
        sage:
          "Start with <strong>hopper.move(steps=3)</strong> to hop up to the log without hitting it. Count squares from Hopper to the wall!",
      },
      {
        title: "Turn to go around",
        sage:
          "Type <strong>hopper.turn(-90)</strong> to face upward, then <strong>hopper.move(steps=3)</strong> to hop above the log.",
      },
      {
        title: "Turn back and finish",
        sage:
          "Use <strong>hopper.turn(90)</strong> to face right again, then <strong>hopper.move(steps=6)</strong> to reach the carrot!",
      },
      {
        title: "Your turn!",
        sage:
          "Type all four commands yourself. If Hopper bonks the log, adjust your numbers and try again!",
      },
    ],
  },
  {
    id: 7,
    title: "Level 7: Square patrol!",
    goal: "Goal: patrol the zigzag twice to find the carrot 🔄",
    start: { x: 2, y: 9, direction: 0 },
    carrot: { x: 8, y: 3 },
    walls: [
      { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },
      { x: 2, y: 8 }, { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 },
      { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 5, y: 4 }, { x: 5, y: 3 },
      { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
      { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
    ],
    demoCode: `for i in range(2):
    hopper.move(steps=3)
    hopper.turn(-90)
    hopper.move(steps=3)
    hopper.turn(90)`,
    hint: "Walls block shortcuts — patrol the full zigzag twice with a for loop!",
    teachesConcept: "forLoop",
    conceptNudge: {
      title: "Good job!",
      celebrationText: "Hopper got the carrot without a loop — clever!",
      sage:
        "Nice solve! Try a <strong>for loop</strong> here too — repeating four lines inside one loop is much easier to read and change in bigger programs.",
      status: "Use a for loop with four indented lines before moving on!",
    },
    welcomeSage:
      "Walls block shortcuts — you must patrol the <strong>zigzag twice</strong>! Use <strong>for i in range(2):</strong> then indent four lines: move, turn left, move, turn right.",
    guidanceSteps: [
      {
        title: "Walls block shortcuts",
        sage:
          "You can't cut straight to the carrot! Trace the zigzag: hop right, turn left, hop up, turn right — then do it again.",
      },
      {
        title: "Repeat a whole pattern",
        sage:
          "This loop repeats <strong>four lines</strong> at once — not just one move! That's how loops save even more typing.",
      },
      {
        title: "The for line",
        sage:
          "Type <strong>for i in range(2):</strong> — the 2 means two full patrol laps. Don't forget the colon!",
      },
      {
        title: "Four indented lines",
        sage:
          "Inside the loop (4 spaces each):<br><strong>hopper.move(steps=3)</strong><br><strong>hopper.turn(-90)</strong><br><strong>hopper.move(steps=3)</strong><br><strong>hopper.turn(90)</strong>",
      },
      {
        title: "Your turn!",
        sage:
          "Write the loop and all four indented lines. Click <strong>Run my code</strong> and watch Hopper patrol!",
      },
    ],
  },
  {
    id: 8,
    title: "Level 8: Rocky path!",
    goal: "Goal: weave through the rocks to the carrot 🪨",
    start: { x: 1, y: 8, direction: 270 },
    carrot: { x: 8, y: 2 },
    walls: [
      { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
      { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
    ],
    demoCode: `hopper.move(steps=4)
hopper.turn(90)
hopper.move(steps=4)
hopper.turn(-90)
hopper.move(steps=2)
hopper.turn(90)
hopper.move(steps=3)`,
    hint: "Hopper starts facing up! Plan each turn before you move.",
    welcomeSage:
      "Rocky terrain ahead! Hopper starts facing <strong>up</strong>. Use moves and turns to weave between the brown rocks — type every line yourself!",
    guidanceSteps: [
      {
        title: "Check Hopper's direction",
        sage:
          "See the green arrow? Hopper faces <strong>up</strong> this time (270°). <strong>hopper.move()</strong> always goes the way the arrow points!",
      },
      {
        title: "Hop north first",
        sage:
          "Type <strong>hopper.move(steps=4)</strong> to hop upward. Count squares so you stop before the rocks!",
      },
      {
        title: "Turn and go east",
        sage:
          "<strong>hopper.turn(90)</strong> turns Hopper right to face east, then <strong>hopper.move(steps=4)</strong> hops across.",
      },
      {
        title: "Weave to the carrot",
        sage:
          "Finish with:<br><strong>hopper.turn(-90)</strong><br><strong>hopper.move(steps=2)</strong><br><strong>hopper.turn(90)</strong><br><strong>hopper.move(steps=3)</strong>",
      },
      {
        title: "Your turn!",
        sage:
          "Plan the full path around every rock, then type all six commands. Use the ghost trail to preview!",
      },
    ],
  },
  {
    id: 9,
    title: "Level 9: Loop then leap!",
    goal: "Goal: zigzag with a loop, then hop to the carrot 🏔️",
    start: { x: 2, y: 10, direction: 0 },
    carrot: { x: 10, y: 1 },
    walls: [
      { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 },
      { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 9 },
      { x: 7, y: 8 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 },
      { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 3 }, { x: 9, y: 3 },
      { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 5 },
      { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 3, y: 8 }, { x: 3, y: 7 },
    ],
    demoCode: `for i in range(3):
    hopper.move(steps=2)
    hopper.turn(-90)
    hopper.move(steps=2)
    hopper.turn(90)
hopper.move(steps=2)
hopper.turn(-90)
hopper.move(steps=3)`,
    hint: "Code after a loop is NOT indented — it runs once at the end!",
    teachesConcept: "forLoop",
    conceptNudge: {
      title: "Good job!",
      celebrationText: "Hopper made it! You skipped the loop but still got there!",
      sage:
        "That path works! This level teaches <strong>loop + extra lines after</strong> — loops handle the repeating part so you don't have to write it all out.",
      status: "Use a for loop plus the final lines before you can advance!",
    },
    welcomeSage:
      "New idea: a loop for the zigzag, then <strong>extra lines after</strong> the loop (no indent!) for the final hops to the carrot.",
    guidanceSteps: [
      {
        title: "Loop + extra steps",
        sage:
          "Sometimes a loop gets you <strong>close</strong> but not all the way. Lines <strong>after</strong> the loop finish the job!",
      },
      {
        title: "The zigzag loop",
        sage:
          "Type <strong>for i in range(3):</strong> with four indented lines inside (move 2, turn left, move 2, turn right).",
      },
      {
        title: "Lines after the loop",
        sage:
          "These three lines are <strong>NOT indented</strong> — they run once after the loop ends:<br><strong>hopper.move(steps=2)</strong><br><strong>hopper.turn(-90)</strong><br><strong>hopper.move(steps=3)</strong>",
      },
      {
        title: "Indentation matters!",
        sage:
          "Indented lines = inside the loop (repeat). Lines flush left = after the loop (run once). Python cares about spaces!",
      },
      {
        title: "Your turn!",
        sage:
          "Write the loop, the four indented lines, AND the three final lines. You're combining everything you've learned!",
      },
    ],
  },
  {
    id: 10,
    title: "Level 10: Forest champion!",
    goal: "Goal: master the final maze and bring Hopper home! 🏆",
    start: { x: 1, y: 9, direction: 0 },
    carrot: { x: 10, y: 2 },
    walls: [
      // Bottom corridor (y=9 row) — block above and below the start path
      { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }, { x: 4, y: 10 },
      { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 },
      // Block right-side shortcut past first corner
      { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },
      // First vertical segment (x=4, y=7–8) — wall on left side only (right side opens to next corridor)
      { x: 3, y: 7 },
      { x: 3, y: 8 },
      // Block open space to the left of vertical (prevent left detour)
      { x: 3, y: 6 }, { x: 5, y: 6 },
      // Second horizontal corridor (y=7, x=4–7) — walls above and below
      { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 },
      { x: 6, y: 6 },
      // Second vertical segment (x=7, y=5–6) — walls either side
      { x: 6, y: 5 },
      { x: 8, y: 6 },
      // Third horizontal corridor (y=5, x=7–10) — walls above and below
      { x: 8, y: 4 }, { x: 9, y: 4 },
      { x: 9, y: 6 },
      // Block top-left open area (prevent diagonal shortcuts)
      { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 1, y: 6 },
      { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      // Final vertical segment (x=10, y=2–4) — left wall
      { x: 9, y: 3 }, { x: 9, y: 2 },
      // Block top row shortcuts
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
      { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
      { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
      // Block open space to the right of final vertical
      { x: 11, y: 4 }, { x: 11, y: 3 }, { x: 11, y: 2 },
    ],
    demoCode: `for i in range(3):
    hopper.move(steps=3)
    hopper.turn(-90)
    hopper.move(steps=2)
    hopper.turn(90)
hopper.turn(-90)
hopper.move(steps=3)`,
    hint: "Loop the zigzag 3 times, then turn and hop to the carrot!",
    teachesConcept: "forLoop",
    conceptNudge: {
      title: "Good job!",
      celebrationText: "Hopper found the carrot — you cracked the final path!",
      sage:
        "Impressive! For the champion level, try the <strong>for loop</strong> method too — it's how real programmers keep long paths short and tidy.",
      status: "Finish with a for loop to complete the quest and move on!",
    },
    welcomeSage:
      "The final challenge! Dense walls force a true zigzag. Use a <strong>for loop</strong> for the repeating zigzag, then <strong>two lines after the loop</strong> for the last hop to the carrot!",
    guidanceSteps: [
      {
        title: "You've got this!",
        sage:
          "The walls are thick here — there's only one correct zigzag path. Combine a loop with extra commands after it, just like Level 9!",
      },
      {
        title: "The zigzag loop",
        sage:
          "Type <strong>for i in range(3):</strong> with four indented lines: move 3, turn left, move 2, turn right. This zigzag repeats exactly 3 times!",
      },
      {
        title: "The final hop",
        sage:
          "After the loop (no indent!):<br><strong>hopper.turn(-90)</strong><br><strong>hopper.move(steps=3)</strong><br>That turns Hopper up and hops all the way to the carrot!",
      },
      {
        title: "Avoid the walls",
        sage:
          "Brown walls block every shortcut — the only open path IS the zigzag. Use the ghost trail to preview and make sure you're on track!",
      },
      {
        title: "Forest champion!",
        sage:
          "Type the full solution yourself. When Hopper reaches the carrot, you're a Python forest hero! 🏆",
      },
    ],
  },
];
