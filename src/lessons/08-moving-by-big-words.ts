import type { Lesson } from "./types";
import { moveBigWord } from "./gen";

export const lesson: Lesson = {
  id: "08-moving-by-big-words",
  title: "Moving by WORDs",
  section: "Essential Motions",
  order: 8,
  intro: [
    "`W`, `B` and `E` work like `w`, `b` and `e` but jump between chunks separated by whitespace: `cart.filter(x)` is one `W` jump and several `w` jumps.",
    "Lowercase to move inside an expression, uppercase to skip over it.",
  ],
  keys: [
    { keys: "W", label: "start of next WORD" },
    { keys: "B", label: "start of previous WORD" },
    { keys: "E", label: "end of WORD ahead" },
  ],
  taskCount: 8,
  generators: [moveBigWord()],
};
