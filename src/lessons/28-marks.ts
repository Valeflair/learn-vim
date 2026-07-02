import type { Lesson } from "./types";
import { markRoundTrip, gotoLine } from "./gen";

export const lesson: Lesson = {
  id: "28-marks",
  title: "Marks",
  section: "Power Tools",
  order: 28,
  intro: [
    "A **mark** is a named bookmark: `ma` remembers the current spot as mark `a`. Later, `'a` jumps back to that line (and `` `a `` to the exact column).",
    "The pattern: mark where you are, go fix something far away, snap back with one keystroke. No scrolling, no re-finding your place.",
    "You get 26 marks (`a`–`z`) per file. In practice two or three cover everything: one at the code you are writing, one at the thing you keep referencing.",
  ],
  keys: [
    { keys: "ma", label: "set mark a at the cursor" },
    { keys: "'a", label: "jump to the line of mark a" },
  ],
  taskCount: 6,
  generators: [markRoundTrip(), gotoLine()],
};
