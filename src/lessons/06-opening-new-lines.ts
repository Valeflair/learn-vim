import type { Lesson } from "./types";
import { openLine, appendEnd } from "./gen";

export const lesson: Lesson = {
  id: "06-opening-new-lines",
  title: "Opening New Lines",
  section: "Insert Like a Pro",
  order: 6,
  intro: [
    "`o` opens a new line **below** the cursor line and drops you straight into insert mode; `O` (capital) opens one **above**. No need to be at the start or end of the line first — they work from anywhere.",
    "This replaces the dance of jumping to the line end, pressing Enter, and typing. One key, and you are exactly where the new line belongs.",
    "The ghost shows a line that is missing. Put the cursor on the highlighted line, open in the right direction, type the missing line, then `Esc`.",
  ],
  keys: [
    { keys: "o", label: "open a line below, insert" },
    { keys: "O", label: "open a line above, insert" },
  ],
  taskCount: 8,
  generators: [openLine("o"), openLine("O"), appendEnd()],
};
