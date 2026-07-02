import type { Lesson } from "./types";
import { deleteChar, substituteChar, replaceChar, toggleCase } from "./gen";

export const lesson: Lesson = {
  id: "07-making-small-edits",
  title: "Making Small Edits",
  section: "Insert Like a Pro",
  order: 7,
  intro: [
    "`x` deletes the character under the cursor. `r` replaces it with the next key you press. `s` deletes it and enters insert mode. `~` toggles its case.",
    "Extra character: `x`. Wrong character: `r`. Wrong and longer than one character: `s`.",
  ],
  keys: [
    { keys: "x", label: "delete character under cursor" },
    { keys: "r", label: "replace character with next key" },
    { keys: "s", label: "substitute: delete and insert" },
    { keys: "~", label: "toggle case" },
  ],
  taskCount: 10,
  generators: [deleteChar(), substituteChar(), replaceChar(), toggleCase()],
};
