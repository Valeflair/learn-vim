import type { Lesson } from "./types";
import { moveLineDown, moveLineTo, copyLineTo } from "./gen";

export const lesson: Lesson = {
  id: "27-moving-lines",
  title: "Moving Text Around",
  section: "Power Tools",
  order: 27,
  intro: [
    "`dd` followed by `p` somewhere else moves a line. `yy` instead of `dd` copies it. `ddp` swaps a line with the one below.",
    "The marked line is the one to move or copy; the ghost shows the destination.",
  ],
  keys: [
    { keys: "dd p", label: "move a line (delete, travel, paste)" },
    { keys: "ddp", label: "swap line with the one below" },
    { keys: "yy p", label: "copy a line elsewhere" },
  ],
  taskCount: 8,
  generators: [moveLineDown(), moveLineTo(), copyLineTo()],
};
