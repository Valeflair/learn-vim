import type { Lesson } from "./types";

const FIELD = [
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
].join("\n");

export const lesson: Lesson = {
  id: "02-basic-movement",
  title: "Basic Movement (hjkl)",
  section: "Fundamentals",
  order: 2,
  steps: [
    {
      kind: "explanation",
      text: "In normal mode, `h` `j` `k` `l` move the cursor: `h` left, `j` down, `k` up, `l` right. Keep your fingers on the home row — no arrow keys. These challenges only need movement: get the cursor to the target position.",
    },
    {
      kind: "challenge",
      id: "02-right",
      instruction: "Move the cursor 4 columns to the right.",
      startText: FIELD,
      startCursor: { line: 0, col: 0 },
      targetText: FIELD,
      targetCursor: { line: 0, col: 4 },
      par: 4,
      hint: "l l l l",
    },
    {
      kind: "challenge",
      id: "02-down",
      instruction: "Move the cursor down to the last line.",
      startText: FIELD,
      startCursor: { line: 0, col: 0 },
      targetText: FIELD,
      targetCursor: { line: 4, col: 0 },
      par: 4,
      hint: "j j j j",
    },
    {
      kind: "challenge",
      id: "02-diagonal",
      instruction: "Move to line 3, column 7 (down 2, right 6).",
      startText: FIELD,
      startCursor: { line: 0, col: 0 },
      targetText: FIELD,
      targetCursor: { line: 2, col: 6 },
      par: 8,
      hint: "j j l l l l l l — order doesn't matter",
    },
    {
      kind: "challenge",
      id: "02-back-up",
      instruction: "Go back up and left: to line 1, column 3.",
      startText: FIELD,
      startCursor: { line: 3, col: 8 },
      targetText: FIELD,
      targetCursor: { line: 0, col: 2 },
      par: 9,
      hint: "k k k then h h h h h h",
    },
  ],
};
