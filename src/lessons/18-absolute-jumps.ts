import type { Lesson } from "./types";
import { gotoLine } from "./gen";

export const lesson: Lesson = {
  id: "18-absolute-jumps",
  title: "Absolute Line Jumps",
  section: "Vertical Motions",
  order: 18,
  intro: [
    "`gg` jumps to the first line, `G` to the last. With a count, `G` goes to that line: `5G` is line 5.",
    "All three land on the first non-blank character. Relative jumps for nearby lines, absolute for the rest.",
  ],
  keys: [
    { keys: "gg", label: "first line" },
    { keys: "G", label: "last line" },
    { keys: "{n}G", label: "line n" },
  ],
  taskCount: 8,
  generators: [gotoLine()],
};
