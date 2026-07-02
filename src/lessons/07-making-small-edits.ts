import type { Lesson } from "./types";
import { deleteChar, substituteChar, replaceChar, toggleCase } from "./gen";

export const lesson: Lesson = {
  id: "07-making-small-edits",
  title: "Making Small Edits",
  section: "Insert Like a Pro",
  order: 7,
  intro: [
    "Three keys fix single-character mistakes without ever entering insert mode for long. `x` deletes the character under the cursor. `r` **replaces** it with the next key you type — perfect for typos, and you never leave normal mode.",
    "`s` (substitute) deletes the character and enters insert mode, for when the fix is more than one character. And `~` toggles the case of the letter under the cursor.",
    "Rule of thumb: one wrong character → `r`; one extra character → `x`; wrong character that needs several → `s`.",
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
