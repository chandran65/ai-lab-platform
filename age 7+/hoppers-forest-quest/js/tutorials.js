/**
 * Sage's line-by-line tutorial explanations
 */
const TUTORIALS = {
  comment: {
    pattern: /^\s*#/,
    explain: (line) =>
      `This is a <strong>comment</strong> — Python ignores lines starting with #. They help YOU remember what your code does!`,
  },
  move: {
    pattern: /hopper\.move\s*\(/,
    explain: (line) => {
      const match = line.match(/steps\s*=\s*(\d+)|hopper\.move\s*\(\s*(\d+)/);
      const steps = match ? match[1] || match[2] : "?";
      return `This line tells Hopper to hop forward <strong>${steps} square${steps === "1" ? "" : "s"}</strong>. Try changing the number and watch what happens!`;
    },
  },
  turn: {
    pattern: /hopper\.turn\s*\(/,
    explain: (line) => {
      const match = line.match(/(-?\d+)/);
      const deg = match ? parseInt(match[1], 10) : 90;
      if (deg > 0) {
        return `hopper.turn(${deg}) rotates Hopper <strong>clockwise</strong> (to the right). 90° = one quarter turn.`;
      }
      if (deg < 0) {
        return `hopper.turn(${deg}) rotates Hopper <strong>counter-clockwise</strong> (to the left).`;
      }
      return `hopper.turn() changes which way Hopper is facing before the next move.`;
    },
  },
  forLoop: {
    pattern: /^\s*for\s+\w+\s+in\s+range\s*\(/,
    explain: (line) => {
      const match = line.match(/range\s*\(\s*(\d+)/);
      const n = match ? match[1] : "?";
      return `A <strong>for loop</strong> repeats the indented lines below it. range(${n}) means "repeat ${n} times."`;
    },
  },
  indent: {
    pattern: /^\s{4,}\S/,
    explain: () =>
      `Lines inside a loop must be <strong>indented</strong> (pushed to the right with spaces). Python uses indentation to know what belongs inside the loop!`,
  },
};

function getLineExplanation(line, levelId) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (TUTORIALS.comment.pattern.test(line)) {
    return TUTORIALS.comment.explain(line);
  }
  if (TUTORIALS.forLoop.pattern.test(line)) {
    return TUTORIALS.forLoop.explain(line);
  }
  if (TUTORIALS.move.pattern.test(line)) {
    return TUTORIALS.move.explain(line);
  }
  if (TUTORIALS.turn.pattern.test(line)) {
    return TUTORIALS.turn.explain(line);
  }
  if (TUTORIALS.indent.pattern.test(line)) {
    return TUTORIALS.indent.explain(line);
  }

  return `This line is part of your program. Run the code to see what it does!`;
}

function getDemoWalkthrough(code) {
  const lines = code.split("\n");
  return lines
    .map((line, i) => ({
      lineNum: i + 1,
      line,
      explanation: getLineExplanation(line, null),
    }))
    .filter((item) => item.explanation && item.line.trim());
}

const CONCEPT_CHECKS = {
  forLoop: (code) => /^\s*for\s+\w+\s+in\s+range\s*\(/m.test(code),
};

function usesTeachesConcept(code, concept) {
  const check = CONCEPT_CHECKS[concept];
  return check ? check(code) : true;
}
