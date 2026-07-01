import type { Lesson } from "./types";

const TEXT = [
  "para one line a",
  "para one line b",
  "",
  "para two line a",
  "para two line b",
  "",
  "para three line a",
].join("\n");

export const lesson: Lesson = {
  id: "07-vertical-movement",
  title: "Vertical Movement ({ })",
  section: "Motions",
  order: 7,
  steps: [
    {
      kind: "explanation",
      text: "`}` jumps forward to the next blank line (paragraph boundary), `{` backward to the previous one. In real files these fly over whole blocks of code or prose.\n\n`Ctrl-d` and `Ctrl-u` scroll half a page down/up — try them here, but they move scroll position rather than producing a unique cursor target, so there's no challenge for them.",
    },
    {
      kind: "challenge",
      id: "07-brace-down",
      instruction: "Jump to the next paragraph boundary with `}`.",
      startText: TEXT,
      startCursor: { line: 0, col: 0 },
      targetText: TEXT,
      targetCursor: { line: 2, col: 0 },
      par: 1,
      hint: "}",
    },
    {
      kind: "challenge",
      id: "07-brace-down2",
      instruction: "Jump two paragraph boundaries forward.",
      startText: TEXT,
      startCursor: { line: 0, col: 0 },
      targetText: TEXT,
      targetCursor: { line: 5, col: 0 },
      par: 2,
      hint: "} }",
    },
    {
      kind: "challenge",
      id: "07-brace-up",
      instruction: "From the last line, jump two paragraph boundaries back with `{`.",
      startText: TEXT,
      startCursor: { line: 6, col: 0 },
      targetText: TEXT,
      targetCursor: { line: 2, col: 0 },
      par: 2,
      hint: "{ {",
    },
  ],
};
