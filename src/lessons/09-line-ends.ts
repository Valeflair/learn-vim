import type { Lesson } from "./types";
import { moveLineEdge } from "./gen";

export const lesson: Lesson = {
  id: "09-line-ends",
  title: "Moving to Line Ends",
  section: "Essential Motions",
  order: 9,
  intro: [
    "`0` moves to the first column, `^` to the first non-blank character, `$` to the last character of the line.",
    "In indented code `^` is usually the one you want. Operators use these motions later: `d$` deletes to the end of the line.",
  ],
  keys: [
    { keys: "0", label: "first column of the line" },
    { keys: "^", label: "first non-blank character" },
    { keys: "$", label: "end of the line" },
  ],
  taskCount: 10,
  generators: [moveLineEdge("0"), moveLineEdge("^"), moveLineEdge("$")],
};
