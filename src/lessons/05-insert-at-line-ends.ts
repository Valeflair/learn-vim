import type { Lesson } from "./types";
import { insertStart, appendEnd, insertMissing } from "./gen";

export const lesson: Lesson = {
  id: "05-insert-at-line-ends",
  title: "Insert at Line Ends",
  section: "Insert Like a Pro",
  order: 5,
  intro: [
    "You almost never want to walk the cursor to the end of a line just to type there. `A` jumps to the end of the line **and** enters insert mode in one keystroke; `I` does the same at the first non-blank character.",
    "Think of them as the capital, line-wide versions of `a` and `i`. They work from anywhere on the line — no motion needed first.",
    "The ghost box shows what is missing. Restore line endings with `A` and line starts with `I`, then `Esc` back to normal mode.",
  ],
  keys: [
    { keys: "A", label: "append at end of line" },
    { keys: "I", label: "insert at first non-blank" },
  ],
  taskCount: 10,
  generators: [insertStart(), appendEnd(), insertMissing()],
};
