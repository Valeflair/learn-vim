import type { Lesson } from "./types";
import { relativeJump, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "17-relative-jumps",
  title: "Relative Line Jumps",
  section: "Vertical Motions",
  order: 17,
  intro: [
    "The gutter shows **hybrid line numbers**: the cursor line has its absolute number in bold, every other line shows its distance from the cursor. That distance is exactly the count for `j` and `k`.",
    "Target five lines down? The gutter already says `5` — press `5j`. No counting, no spamming `j`. One glance, one command.",
    "This is how experienced Vim users move vertically nearly all the time. Train your eyes to read the relative number before your fingers move.",
  ],
  keys: [
    { keys: "{n}j", label: "jump n lines down" },
    { keys: "{n}k", label: "jump n lines up" },
  ],
  taskCount: 10,
  generators: [relativeJump(), gridMove()],
};
