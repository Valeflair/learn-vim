import type { Lesson } from "./types";
import { moveWordStart, moveWordEnd, moveBigWord, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "04-word-motions",
  title: "Word Motions",
  section: "Motions",
  order: 4,
  intro: [
    "Moving letter-by-letter with `h` and `l` is slow. `w` jumps forward to the start of the next **word**, `b` jumps back to the start of the previous one, and `e` lands on the **end** of the current or next word.",
    "Capitalized variants treat punctuation as part of the word: `W` and `B` move by **WORD** — anything between spaces. On code like `foo.bar(baz)`, `w` stops at every dot and bracket while `W` clears the whole token in one hop.",
    "Counts work too: `3w` is three words forward. Watch how far the green target is and pick the cheapest motion.",
  ],
  keys: [
    { keys: "w / b", label: "next / previous word start" },
    { keys: "e", label: "end of word" },
    { keys: "W / B", label: "next / previous WORD (space-separated)" },
  ],
  taskCount: 10,
  generators: [moveWordStart(), moveWordEnd(), moveBigWord(), gridMove()],
};
