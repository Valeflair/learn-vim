import type { Lesson } from "./types";
import { paraJump } from "./gen";

export const lesson: Lesson = {
  id: "19-paragraph-jumps",
  title: "Paragraph Jumps",
  section: "Vertical Motions",
  order: 19,
  intro: [
    "`}` jumps to the next blank line, `{` to the previous one. In code that means block by block.",
    "Both are motions, so `d}` deletes to the end of the block. Here, land on the marked blank line.",
  ],
  keys: [
    { keys: "}", label: "next blank line" },
    { keys: "{", label: "previous blank line" },
  ],
  taskCount: 8,
  generators: [paraJump()],
};
