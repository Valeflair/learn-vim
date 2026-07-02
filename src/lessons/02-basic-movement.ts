import type { Lesson } from "./types";
import { gridMove } from "./gen";

export const lesson: Lesson = {
  id: "02-basic-movement",
  title: "Basic Movement",
  section: "Basics",
  order: 2,
  intro: [
    "In normal mode you move with `h` `j` `k` `l` — no arrow keys, no mouse. Your fingers never leave the home row: `h` is on the left and moves left, `l` is on the right and moves right.",
    "`j` looks a bit like a down-arrow and moves **down**; `k` moves **up**. It feels alien for about ten minutes, then it becomes muscle memory.",
    "Move the cursor onto the green cell to complete each task. Try to think in direction + repetition: three lines down is `jjj` (or `3j`).",
  ],
  keys: [
    { keys: "h", label: "move left" },
    { keys: "j", label: "move down" },
    { keys: "k", label: "move up" },
    { keys: "l", label: "move right" },
  ],
  taskCount: 8,
  generators: [gridMove()],
};
