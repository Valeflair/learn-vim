import type { Lesson } from "./types";
import { relativeJump, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "17-relative-jumps",
  title: "Relative Line Jumps",
  section: "Vertical Motions",
  order: 17,
  intro: [
    "The gutter shows the cursor line's absolute number; every other line shows its distance from the cursor. That distance is the count for `j` or `k`.",
    "A target five lines down reads `5`, so press `5j`.",
  ],
  keys: [
    { keys: "{n}j", label: "jump n lines down" },
    { keys: "{n}k", label: "jump n lines up" },
  ],
  taskCount: 10,
  generators: [relativeJump(), gridMove()],
};
