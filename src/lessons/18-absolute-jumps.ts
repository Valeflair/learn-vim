import type { Lesson } from "./types";
import { gotoLine, relativeJump } from "./gen";

export const lesson: Lesson = {
  id: "18-absolute-jumps",
  title: "Absolute Line Jumps",
  section: "Vertical Motions",
  order: 18,
  intro: [
    "`gg` jumps to the first line of the file, `G` to the last. With a count, `G` goes to that exact line: `5G` is line 5 — the move you want when a compiler error says \"line 5\".",
    "All three land on the first non-blank character of the target line, so you arrive ready to read or edit.",
    "Relative jumps for nearby lines, absolute jumps for far ends and known line numbers. Mix them here.",
  ],
  keys: [
    { keys: "gg", label: "first line" },
    { keys: "G", label: "last line" },
    { keys: "{n}G", label: "line n" },
  ],
  taskCount: 8,
  generators: [gotoLine(), relativeJump()],
};
