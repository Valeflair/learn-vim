import type { Lesson } from "./types";
import { markRoundTrip, gotoLine } from "./gen";

export const lesson: Lesson = {
  id: "28-marks",
  title: "Marks",
  section: "Power Tools",
  order: 28,
  intro: [
    "`ma` sets mark `a` at the cursor. `'a` jumps back to that line, `` `a `` to the exact position.",
    "Set a mark, edit somewhere else, jump back with one keystroke.",
  ],
  keys: [
    { keys: "ma", label: "set mark a at the cursor" },
    { keys: "'a", label: "jump to the line of mark a" },
  ],
  taskCount: 6,
  generators: [markRoundTrip(), gotoLine()],
};
