import type { Lesson } from "./types";
import { gridMove } from "./gen";

export const lesson: Lesson = {
  id: "02-basic-movement",
  title: "Basic Movement",
  section: "Basics",
  order: 2,
  intro: [
    "`h` `j` `k` `l` move left, down, up, right. Arrow keys and the mouse are disabled here on purpose.",
    "Move onto the green cell to finish a task. Counts work: `3j` goes three lines down.",
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
