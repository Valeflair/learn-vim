import type { Lesson } from "./types";
import { moveWordStart, moveWordEnd, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "03-moving-by-words",
  title: "Moving by Words",
  section: "Basics",
  order: 3,
  intro: [
    "Pressing `l` twelve times is not the Vim way. `w` jumps forward to the start of the next word, `b` jumps back to the start of the previous one, and `e` lands on the last letter of the word ahead.",
    "In code, punctuation counts as its own small word: from `items` a `w` lands on the `.` in `items.length`, and the next `w` on `length`. That granularity is exactly what you want when editing code.",
    "Counts work here too: `3w` is three word-hops. Watch how much faster the green cell arrives compared to holding `l`.",
  ],
  keys: [
    { keys: "w", label: "start of next word" },
    { keys: "b", label: "start of previous word" },
    { keys: "e", label: "end of word ahead" },
  ],
  taskCount: 10,
  generators: [moveWordStart(), moveWordEnd(), gridMove()],
};
