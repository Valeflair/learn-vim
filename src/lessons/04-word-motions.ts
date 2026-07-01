import type { Lesson } from "./types";

const PROSE = ["the quick brown fox jumps", "over the lazy dog today"].join("\n");
const CODE = "foo.bar(baz, qux) end";

export const lesson: Lesson = {
  id: "04-word-motions",
  title: "Word Motions (w b e ge)",
  section: "Motions",
  order: 4,
  steps: [
    {
      kind: "explanation",
      text: "Moving one character at a time is slow. `w` jumps to the start of the next word, `b` back to the start of the previous word, `e` to the end of the current/next word, and `ge` to the end of the previous word.",
    },
    {
      kind: "challenge",
      id: "04-w",
      instruction: "Jump to the start of `brown` using `w`.",
      startText: PROSE,
      startCursor: { line: 0, col: 0 },
      targetText: PROSE,
      targetCursor: { line: 0, col: 10 },
      par: 2,
      hint: "w w",
    },
    {
      kind: "challenge",
      id: "04-e",
      instruction: "Jump to the end of `fox` using `e`.",
      startText: PROSE,
      startCursor: { line: 0, col: 0 },
      targetText: PROSE,
      targetCursor: { line: 0, col: 18 },
      par: 4,
      hint: "e e e e",
    },
    {
      kind: "challenge",
      id: "04-b",
      instruction: "From the end of the line, jump back to the start of `quick` using `b`.",
      startText: PROSE,
      startCursor: { line: 0, col: 24 },
      targetText: PROSE,
      targetCursor: { line: 0, col: 4 },
      par: 4,
      hint: "b b b b",
    },
    {
      kind: "challenge",
      id: "04-ge",
      instruction: "The cursor is on `lazy`. Jump to the end of the previous word with `ge`.",
      startText: PROSE,
      startCursor: { line: 1, col: 9 },
      targetText: PROSE,
      targetCursor: { line: 1, col: 7 },
      par: 2,
      hint: "ge",
    },
    {
      kind: "explanation",
      text: "Capital `W` `B` `E` move by **WORDS**: chunks separated only by whitespace, ignoring punctuation. On `foo.bar(baz,` a `w` stops at every dot and paren; `W` skips the whole thing.",
    },
    {
      kind: "challenge",
      id: "04-W",
      instruction: "Jump to `end` in just 2 keystrokes using `W`.",
      startText: CODE,
      startCursor: { line: 0, col: 0 },
      targetText: CODE,
      targetCursor: { line: 0, col: 18 },
      par: 2,
      hint: "W W — compare with how many w presses it would take",
    },
  ],
};
