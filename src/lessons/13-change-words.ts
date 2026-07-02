import type { Lesson } from "./types";
import { changeWord, deleteWord } from "./gen";

export const lesson: Lesson = {
  id: "13-change-words",
  title: "Change Words",
  section: "Operators",
  order: 13,
  intro: [
    "`c` is delete-then-insert: it removes the range and drops you into insert mode to type the replacement. `cw` changes to the end of the word; `ciw` (change **inner word**) replaces the whole word under the cursor from anywhere inside it.",
    "`ciw` is one of the highest-value commands in Vim: cursor anywhere in a name, `ciw`, type the new name, `Esc`. Renaming has never been faster.",
    "The red word is wrong; the instruction tells you what it should be. Change it and escape back to normal mode.",
  ],
  keys: [
    { keys: "cw", label: "change to end of word" },
    { keys: "ciw", label: "change the whole word" },
  ],
  taskCount: 10,
  generators: [changeWord("cw"), changeWord("ciw"), deleteWord("dw")],
};
