import type { Lesson } from "./types";
import { openLine, appendEnd } from "./gen";

export const lesson: Lesson = {
  id: "06-opening-new-lines",
  title: "Opening New Lines",
  section: "Insert Like a Pro",
  order: 6,
  intro: [
    "`o` opens a new line below the cursor and enters insert mode. `O` opens one above. Both work from anywhere in the line.",
    "Put the cursor on the marked line, open a line in the right direction, type the missing text, press `Esc`.",
  ],
  keys: [
    { keys: "o", label: "open a line below, insert" },
    { keys: "O", label: "open a line above, insert" },
  ],
  taskCount: 8,
  generators: [openLine("o"), openLine("O"), appendEnd()],
};
