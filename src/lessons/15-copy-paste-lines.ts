import type { Lesson } from "./types";
import { duplicateLine, copyLineTo, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "15-copy-paste-lines",
  title: "Copy & Paste Lines",
  section: "Operators",
  order: 15,
  intro: [
    "`yy` copies (yanks) the current line. `p` pastes it below the cursor line, `P` above.",
    "The blue line is the one to copy; the ghost shows where the copy goes. Yank, travel, paste.",
  ],
  keys: [
    { keys: "yy", label: "yank (copy) the line" },
    { keys: "p", label: "paste below the cursor line" },
    { keys: "P", label: "paste above the cursor line" },
  ],
  taskCount: 8,
  generators: [duplicateLine(), copyLineTo(), deleteLine()],
};
