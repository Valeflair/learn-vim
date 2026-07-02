import type { Lesson } from "./types";
import { visualDeleteSpan, changeWord } from "./gen";

export const lesson: Lesson = {
  id: "25-visual-mode",
  title: "Visual Mode",
  section: "Visual Mode",
  order: 25,
  intro: [
    "`v` starts **visual mode**: the cursor becomes one end of a selection, and every motion grows or shrinks it. When the selection is right, press an operator — `d` deletes it, `c` changes it, `y` yanks it.",
    "Visual mode is see-then-act: instead of predicting what `d3w` covers, you watch the selection and adjust. Slower than pure operators, but always safe.",
    "`o` inside a selection swaps the cursor to the other end, and `Esc` abandons the selection. Select the red span exactly, then delete it.",
  ],
  keys: [
    { keys: "v", label: "start character-wise selection" },
    { keys: "d", label: "delete the selection" },
    { keys: "o", label: "swap selection ends" },
  ],
  taskCount: 8,
  generators: [visualDeleteSpan(), changeWord("ciw")],
};
