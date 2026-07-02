import type { Lesson } from "./types";
import { deleteLine, deleteToEnd, deleteLinesDown, deleteWord } from "./gen";

export const lesson: Lesson = {
  id: "14-delete-lines",
  title: "Delete Lines",
  section: "Operators",
  order: 14,
  intro: [
    "Doubling an operator makes it act on the whole line: `dd` deletes the cursor line, no matter where in the line you are. It is the fastest \"remove this line\" in any editor.",
    "`D` (capital) deletes from the cursor to the end of the line — ideal for chopping off a junk tail while keeping the start. It is short for `d$`.",
    "Line deletes take motions too: `dj` deletes the current line **and** the one below (delete + down). Two stray lines, one command.",
  ],
  keys: [
    { keys: "dd", label: "delete the whole line" },
    { keys: "D", label: "delete to end of line" },
    { keys: "dj", label: "delete this line and the next" },
  ],
  taskCount: 10,
  generators: [deleteLine(), deleteToEnd(), deleteLinesDown(), deleteWord("daw")],
};
