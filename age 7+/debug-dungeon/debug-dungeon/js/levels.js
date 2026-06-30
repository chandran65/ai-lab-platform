/**
 * Debug Dungeon: The Code Knight — Level Data
 *
 * Each level = one monster, one buggy code snippet, one error.
 * `code`: array of line objects. Each line has tokens; the buggy
 *         token(s) are marked `bug: true` and are the only clickable
 *         targets. Clicking a non-bug token does nothing harmful but
 *         doesn't fix anything (no punishment, just no progress).
 *
 * `errorMessage`: the exact message shown in the "monster's attack" box,
 *                  styled like a real Python traceback tail line.
 * `quiz`: the comprehension check shown BEFORE the code becomes clickable.
 *         One correct answer, two plausible distractors.
 * `explain`: shown after the fix, cements the concept.
 */

const LEVELS = [
  // ---------------------------------------------------------------
  {
    id: 1,
    monster: { name: "Typo Troll", emoji: "👹", hp: 1 },
    concept: "NameError — misspelled variable",
    title: "Level 1: The Typo Troll",
    intro: "The Typo Troll guards the gate. Its sword is etched with broken code!",
    code: [
      { text: 'plyer_health = 100' },
      { text: 'print(', plain: true },
      { text: 'player_health', bug: true, fix: 'plyer_health' },
      { text: ')', plain: true },
    ],
    errorMessage: `NameError: name 'player_health' is not defined`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "It can't find a variable with that exact name anywhere above", correct: true },
        { text: "The variable's value is too large", correct: false },
        { text: "print() is spelled wrong", correct: false },
      ],
    },
    explain:
      "Python is picky about spelling! <code>plyer_health</code> and <code>player_health</code> are two completely different names to Python, even though they look almost the same to us. A <strong>NameError</strong> means: \"I looked everywhere and never saw this name created.\" Fix: make every spelling of the variable match exactly.",
  },

  // ---------------------------------------------------------------
  {
    id: 2,
    monster: { name: "Glue Goblin", emoji: "👺", hp: 1 },
    concept: 'TypeError — str + int concatenation',
    title: "Level 2: The Glue Goblin",
    intro: "The Glue Goblin tries to smash a number and a word together — badly.",
    code: [
      { text: 'score = 10' },
      { text: 'print("Score: " + ', plain: true },
      { text: 'score', bug: true, fix: 'str(score)' },
      { text: ')', plain: true },
    ],
    errorMessage: `TypeError: can only concatenate str (not "int") to str`,
    quiz: {
      question: 'What is Python complaining about?',
      options: [
        { text: '"+" is trying to join text and a number, but it only knows how to join text to text', correct: true },
        { text: "The variable score doesn't exist", correct: false },
        { text: "There's a missing closing bracket", correct: false },
      ],
    },
    explain:
      'A <strong>TypeError</strong> means two pieces of data don\'t mix the way you tried to mix them. <code>"Score: "</code> is text (a <strong>str</strong>), but <code>score</code> is a number (an <strong>int</strong>). The <code>+</code> operator for text only accepts more text. Wrap the number in <code>str()</code> to turn it into text first: <code>str(score)</code>.',
  },

  // ---------------------------------------------------------------
  {
    id: 3,
    monster: { name: "Colon Crab", emoji: "🦀", hp: 1 },
    concept: "SyntaxError — missing colon",
    title: "Level 3: The Colon Crab",
    intro: "The Colon Crab snipped off a piece of the spell. Something's missing!",
    code: [
      { text: 'health = 20' },
      { text: 'if health > 0', bug: true, fix: 'if health > 0:' },
      { text: '    print("Still standing!")', plain: true },
    ],
    errorMessage: `SyntaxError: expected ':'`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "The structure of the line itself is broken — a required symbol is missing", correct: true },
        { text: "health isn't a real number", correct: false },
        { text: "print is misspelled", correct: false },
      ],
    },
    explain:
      "A <strong>SyntaxError</strong> means the line doesn't follow Python's grammar rules — it never even ran the code, because it couldn't understand the sentence. Every <code>if</code>, <code>for</code>, and <code>while</code> line needs to end with a colon <code>:</code> before the indented block underneath it. No colon, no deal.",
  },

  // ---------------------------------------------------------------
  {
    id: 4,
    monster: { name: "Indent Imp", emoji: "😈", hp: 1 },
    concept: "IndentationError",
    title: "Level 4: The Indent Imp",
    intro: "The Indent Imp shoved the code sideways — nothing lines up anymore!",
    code: [
      { text: 'for i in range(3):' },
      { text: 'print("Hop!")', bug: true, fix: '    print("Hop!")' },
    ],
    errorMessage: `IndentationError: expected an indented block after 'for' statement on line 1`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "The line after the colon needs to be indented (pushed in with spaces) to show it's inside the loop", correct: true },
        { text: "range(3) should be range(4)", correct: false },
        { text: "for loops can't print things", correct: false },
      ],
    },
    explain:
      "Python uses <strong>indentation</strong> (spaces at the start of a line) instead of curly braces to show what's \"inside\" a loop or if-statement. Forget the spaces, and Python has no idea the line belongs to the loop above it — that's an <strong>IndentationError</strong>. Four spaces is the standard.",
  },

  // ---------------------------------------------------------------
  {
    id: 5,
    monster: { name: "Argument Ogre", emoji: "👹", hp: 1 },
    concept: "TypeError — wrong number of arguments",
    title: "Level 5: The Argument Ogre",
    intro: "The Argument Ogre demands the exact right number of ingredients!",
    code: [
      { text: 'def heal(amount, target):' },
      { text: '    return target + amount' },
      { text: '' },
      { text: 'heal(15)', bug: true, fix: 'heal(15, "knight")' },
    ],
    errorMessage: `TypeError: heal() missing 1 required positional argument: 'target'`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "The function needs two pieces of information (arguments) to run, but only got one", correct: true },
        { text: "heal isn't a real function name", correct: false },
        { text: "15 should be a string instead of a number", correct: false },
      ],
    },
    explain:
      "When you define a function with <code>def heal(amount, target):</code>, you're promising to always supply <strong>both</strong> pieces of information every time you call it. Leave one out, and Python throws a <strong>TypeError</strong> telling you exactly which argument is missing.",
  },

  // ---------------------------------------------------------------
  {
    id: 6,
    monster: { name: "Order Orc", emoji: "👹", hp: 1 },
    concept: "NameError — used before assignment",
    title: "Level 6: The Order Orc",
    intro: "The Order Orc scrambled the order of the spellbook!",
    code: [
      { text: 'print(', plain: true },
      { text: 'mana', bug: true, fix: 'mana' , moveBelow: true},
      { text: ')', plain: true },
      { text: 'mana = 50', plain: true, isDefinition: true },
    ],
    errorMessage: `NameError: name 'mana' is not defined`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "The variable is being used one line before it's actually created", correct: true },
        { text: "mana is spelled wrong somewhere", correct: false },
        { text: "Numbers can't be printed", correct: false },
      ],
    },
    explain:
      "Python runs your code <strong>top to bottom, one line at a time</strong>. <code>mana</code> isn't created until line 4 runs — but line 1 tries to use it before that ever happens. Order matters: a variable must exist <em>before</em> you reference it. Fix: swap the order of the lines so the assignment comes first.",
    customFix: "swap",
  },

  // ---------------------------------------------------------------
  {
    id: 7,
    monster: { name: "Bracket Banshee", emoji: "👻", hp: 1 },
    concept: "SyntaxError — unclosed bracket",
    title: "Level 7: The Bracket Banshee",
    intro: "The Bracket Banshee wails... and steals closing symbols!",
    code: [
      { text: 'inventory = ["sword", "shield", "potion"', bug: true, fix: 'inventory = ["sword", "shield", "potion"]' },
      { text: 'print(inventory)', plain: true },
    ],
    errorMessage: `SyntaxError: '[' was never closed`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "An opening bracket [ was never matched with a closing bracket ]", correct: true },
        { text: "Lists can't hold text, only numbers", correct: false },
        { text: "inventory is a reserved word in Python", correct: false },
      ],
    },
    explain:
      "Every opening symbol — <code>(</code>, <code>[</code>, or quote mark — needs a matching closer. Python reads the whole line (and beyond!) looking for that closing <code>]</code>, and when it hits the end of the file without finding one, it reports exactly where the unclosed bracket started.",
  },

  // ---------------------------------------------------------------
  {
    id: 8,
    monster: { name: "Compare Chimera", emoji: "🐉", hp: 1 },
    concept: "TypeError — comparing str and int",
    title: "Level 8: The Compare Chimera",
    intro: "The Compare Chimera has two heads that don't speak the same language!",
    code: [
      { text: 'level = "5"' },
      { text: 'if level > ', plain: true },
      { text: '3', bug: true, fix: 'int(level)' , replaceWhole: 'if level > 3:'},
      { text: ':', plain: true },
      { text: '    print("Level up!")', plain: true },
    ],
    errorMessage: `TypeError: '>' not supported between instances of 'str' and 'int'`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "It can't tell which is bigger when comparing text to a number — they're different types", correct: true },
        { text: "There's a missing colon", correct: false },
        { text: "level needs to be deleted first", correct: false },
      ],
    },
    explain:
      "<code>level</code> is the <strong>text</strong> <code>\"5\"</code> (in quotes), not the number 5. Python won't guess whether you meant to compare it as text or as a number — that's ambiguous, so it refuses with a <strong>TypeError</strong>. Fix: convert it with <code>int(level)</code> so both sides of <code>&gt;</code> are numbers.",
    customFix: "intWrap",
  },

  // ---------------------------------------------------------------
  {
    id: 9,
    monster: { name: "Index Hydra", emoji: "🐲", hp: 1 },
    concept: "IndexError — out of range",
    title: "Level 9: The Index Hydra",
    intro: "The Index Hydra has three heads... but reaches for a fourth!",
    code: [
      { text: 'heads = ["red", "blue", "green"]' },
      { text: 'print(heads[', plain: true },
      { text: '3', bug: true, fix: '2' },
      { text: '])', plain: true },
    ],
    errorMessage: `IndexError: list index out of range`,
    quiz: {
      question: "What is Python complaining about?",
      options: [
        { text: "It's trying to grab an item at a position that doesn't exist in the list", correct: true },
        { text: "Lists can only hold 2 items", correct: false },
        { text: "heads is spelled wrong", correct: false },
      ],
    },
    explain:
      "Python counts list positions starting at <strong>0</strong>, not 1. A list with 3 items has positions <code>0</code>, <code>1</code>, and <code>2</code> — there is no position <code>3</code>. Reaching past the last valid position throws an <strong>IndexError</strong>. This off-by-one mistake is one of the most common bugs in all of programming!",
  },

  // ---------------------------------------------------------------
  {
    id: 10,
    monster: { name: "The Silent Sphinx", emoji: "🐺", hp: 1 },
    concept: "Logic error — no crash, wrong answer",
    title: "Level 10: The Silent Sphinx (Final Boss)",
    intro:
      "The Sphinx doesn't crash your code... it just makes it lie to you. No red error this time — read carefully!",
    code: [
      { text: 'total = 0' },
      { text: 'for i in range(5):' },
      { text: '    total = total + i', plain: true },
      { text: 'print(total)', plain: true },
      { text: '# Knight expected this to add 1+2+3+4+5 = 15', isComment: true },
    ],
    errorMessage: null,
    runOutput: "0 + 1 + 2 + 3 + 4 = 10  (printed: 10, expected: 15)",
    quiz: {
      question: "There's no error message — the code runs fine but gives the wrong number. What's actually happening?",
      options: [
        { text: "range(5) counts 0,1,2,3,4 — it never reaches 5, so 5 is missing from the total", correct: true },
        { text: "The for loop ran the wrong number of times by accident randomly", correct: false },
        { text: "total = 0 should have been total = 1", correct: false },
      ],
    },
    code2fix: {
      bugLine: 'for i in range(5):',
      fix: 'for i in range(6):',
    },
    explain:
      "This is a <strong>logic error</strong> — the scariest kind, because Python never complains! The code is perfectly valid, it just doesn't do what the Knight intended. <code>range(5)</code> produces <code>0,1,2,3,4</code> (five numbers, but stopping <em>before</em> 5). To include 5, you need <code>range(6)</code>. Always double check: does my loop count include everything I expect?",
    customFix: "rangeBoss",
  },
];
