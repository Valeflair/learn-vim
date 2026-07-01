import type { Lesson } from "./types";

const CODE = [
  "function a() {",
  "  return 1;",
  "}",
  "function b() {",
  "  return 2;",
  "}",
].join("\n");

export const lesson: Lesson = {
  id: "16-marks",
  title: "Marks (m ` ')",
  section: "Power features",
  order: 16,
  steps: [
    {
      kind: "explanation",
      text: "`m{letter}` drops a mark at the cursor. `` `{letter} `` jumps back to the **exact position**; `'{letter}` jumps to the **start of that line**. Marks make round-trips painless: mark, wander anywhere, snap back.",
    },
    {
      kind: "challenge",
      id: "16-mark-back",
      instruction: "Move down two lines (`jj`), set mark `a` there, jump to the last line with `G`, then jump back exactly with `` `a ``.",
      startText: CODE,
      startCursor: { line: 0, col: 0 },
      targetText: CODE,
      targetCursor: { line: 2, col: 0 },
      par: 7,
      hint: "j j ma G `a",
    },
    {
      kind: "challenge",
      id: "16-tick",
      instruction: "Go to the last line with `G`, set mark `b`, return to the top with `gg`, then jump to mark b's **line** with `'b`.",
      startText: CODE,
      startCursor: { line: 0, col: 0 },
      targetText: CODE,
      targetCursor: { line: 5, col: 0 },
      par: 7,
      hint: "G mb gg 'b",
    },
    {
      kind: "challenge",
      id: "16-exact",
      instruction: "The cursor is on the `2`. Set mark `a`, jump to the top with `gg`, jump back exactly with `` `a ``, then move one right.",
      startText: CODE,
      startCursor: { line: 4, col: 9 },
      targetText: CODE,
      targetCursor: { line: 4, col: 10 },
      par: 7,
      hint: "ma gg `a l",
    },
  ],
};
