import type { Lesson } from "./types";
import { changeWord, deleteWord } from "./gen";

export const lesson: Lesson = {
  id: "13-change-words",
  title: "Change Words",
  section: "Operators",
  order: 13,
  intro: [
    "`c` deletes a range and enters insert mode. `cw` changes to the end of the word, `ciw` the whole word under the cursor, from anywhere inside it.",
    "Change the red word to what the instruction says, then `Esc`.",
  ],
  keys: [
    { keys: "cw", label: "change to end of word" },
    { keys: "ciw", label: "change the whole word" },
  ],
  taskCount: 10,
  generators: [changeWord("cw"), changeWord("ciw"), deleteWord("dw")],
};
