import type { Lesson } from "./types";
import { moveWordStart, moveWordEnd, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "03-moving-by-words",
  title: "Moving by Words",
  section: "Basics",
  order: 3,
  intro: [
    "`w` moves to the start of the next word, `b` to the start of the previous one, `e` to the end of the word ahead. Punctuation counts as a word: from `items`, `w` lands on the dot in `items.length`.",
    "Counts apply here too: `3w` makes three jumps.",
  ],
  keys: [
    { keys: "w", label: "start of next word" },
    { keys: "b", label: "start of previous word" },
    { keys: "e", label: "end of word ahead" },
  ],
  taskCount: 10,
  generators: [moveWordStart(), moveWordEnd(), gridMove()],
};
