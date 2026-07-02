import type { Lesson } from "./types";
import { deleteChar, deleteWord, deleteLine, deleteToEnd, gotoLine } from "./gen";

export const lesson: Lesson = {
  id: "08-deleting",
  title: "Deleting",
  section: "Editing",
  order: 8,
  intro: [
    "Your first real edits. `x` deletes the character **under** the cursor — perfect for stray letters. `dw` deletes from the cursor to the start of the next word, so put the cursor on the first letter and the whole word plus its trailing space disappears.",
    "`dd` deletes the entire current line, and `D` deletes from the cursor to the end of the line, leaving the start intact.",
    "Notice the pattern in `dw`: `d` is an **operator** (delete) and `w` is the motion you already know. Vim is a language — that grammar is the whole point, and there is much more of it coming.",
  ],
  keys: [
    { keys: "x", label: "delete character under cursor" },
    { keys: "dw", label: "delete to the next word start" },
    { keys: "dd", label: "delete the whole line" },
    { keys: "D", label: "delete to the end of the line" },
  ],
  taskCount: 10,
  generators: [deleteChar(), deleteWord("dw"), deleteLine(), deleteToEnd(), gotoLine()],
};
