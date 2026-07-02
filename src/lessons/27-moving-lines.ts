import type { Lesson } from "./types";
import { moveLineDown, moveLineTo, copyLineTo } from "./gen";

export const lesson: Lesson = {
  id: "27-moving-lines",
  title: "Moving Text Around",
  section: "Power Tools",
  order: 27,
  intro: [
    "Deleting and pasting are two halves of **move**: `dd` puts the line in a register, `p` drops it below wherever you go. `ddp` — delete, paste — swaps a line with the one below it.",
    "The register survives any motion in between, so `dd`, travel across the file, `p` relocates a line anywhere. `yy` instead of `dd` makes it a copy instead of a move.",
    "The red or blue line is the one to move or copy; the ghost marker shows its destination.",
  ],
  keys: [
    { keys: "dd p", label: "move a line (delete, travel, paste)" },
    { keys: "ddp", label: "swap line with the one below" },
    { keys: "yy p", label: "copy a line elsewhere" },
  ],
  taskCount: 8,
  generators: [moveLineDown(), moveLineTo(), copyLineTo()],
};
