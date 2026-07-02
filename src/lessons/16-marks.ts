import type { Lesson } from "./types";
import { markRoundTrip, gotoLine, searchWord } from "./gen";

export const lesson: Lesson = {
  id: "16-marks",
  title: "Marks",
  section: "Power Tools",
  order: 16,
  intro: [
    "A mark is a named bookmark in the buffer. `ma` marks the cursor position as `a`; from anywhere, `'a` jumps back to that line (and `` `a `` returns to the exact column).",
    "The everyday use: you are deep in something, need a quick fix elsewhere, and want to come straight back. Mark, go fix, `'a`, and you never lost your place.",
    "You have 26 marks, `a` through `z`, per buffer. Most people live happily on two or three.",
  ],
  keys: [
    { keys: "ma", label: "set mark a at the cursor" },
    { keys: "'a", label: "jump to the line of mark a" },
    { keys: "`a", label: "jump to the exact position of mark a" },
  ],
  taskCount: 8,
  generators: [markRoundTrip(), gotoLine(), searchWord("*")],
};
