import type { Lesson } from "./types";
import { insertStart, appendEnd, insertMissing } from "./gen";

export const lesson: Lesson = {
  id: "05-insert-at-line-ends",
  title: "Insert at Line Ends",
  section: "Insert Like a Pro",
  order: 5,
  intro: [
    "`A` enters insert mode at the end of the line, `I` at the first non-blank character. Both work from anywhere on the line.",
    "Restore missing line endings with `A` and missing line starts with `I`, then `Esc`.",
  ],
  keys: [
    { keys: "A", label: "append at end of line" },
    { keys: "I", label: "insert at first non-blank" },
  ],
  taskCount: 10,
  generators: [insertStart(), appendEnd(), insertMissing()],
};
