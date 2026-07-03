import type { Lesson } from "./types";
import { visualDeleteSpan } from "./gen";

export const lesson: Lesson = {
  id: "25-visual-mode",
  title: "Visual Mode",
  section: "Visual Mode",
  order: 25,
  intro: [
    "`v` starts a selection. Motions extend it; `d`, `c` or `y` act on it. `o` moves the cursor to the other end, `Esc` cancels.",
    "Select the red text exactly, then delete it.",
  ],
  keys: [
    { keys: "v", label: "start character-wise selection" },
    { keys: "d", label: "delete the selection" },
    { keys: "o", label: "swap selection ends" },
  ],
  taskCount: 8,
  generators: [visualDeleteSpan()],
};
