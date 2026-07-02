import type { Lesson } from "./types";
import { deleteLine, deleteToEnd, deleteLinesDown, deleteWord } from "./gen";

export const lesson: Lesson = {
  id: "14-delete-lines",
  title: "Delete Lines",
  section: "Operators",
  order: 14,
  intro: [
    "`dd` deletes the current line, from anywhere in it. `D` deletes from the cursor to the end of the line (same as `d$`).",
    "Motions work too: `dj` deletes this line and the one below.",
  ],
  keys: [
    { keys: "dd", label: "delete the whole line" },
    { keys: "D", label: "delete to end of line" },
    { keys: "dj", label: "delete this line and the next" },
  ],
  taskCount: 10,
  generators: [deleteLine(), deleteToEnd(), deleteLinesDown(), deleteWord("daw")],
};
