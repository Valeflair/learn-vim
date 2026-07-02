import type { Lesson } from "./types";
import { duplicateLine, copyLineTo, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "15-copy-paste-lines",
  title: "Copy & Paste Lines",
  section: "Operators",
  order: 15,
  intro: [
    "`y` (yank) is Vim's copy operator, and like `d` it doubles: `yy` yanks the whole line. `p` pastes the yanked line **below** the cursor line, `P` pastes it above.",
    "Everything `d` deletes is also yanked — deleted text lands in the same register, so `dd` + `p` moves a line. For now, focus on `yy` and where `p` drops the copy.",
    "The blue highlight marks the line to copy; the ghost marker shows where the copy belongs. Yank, travel, paste.",
  ],
  keys: [
    { keys: "yy", label: "yank (copy) the line" },
    { keys: "p", label: "paste below the cursor line" },
    { keys: "P", label: "paste above the cursor line" },
  ],
  taskCount: 8,
  generators: [duplicateLine(), copyLineTo(), deleteLine()],
};
