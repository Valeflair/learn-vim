import type { Lesson } from "./types";
import { deleteWord, deleteTwoWords, deleteChar } from "./gen";

export const lesson: Lesson = {
  id: "12-delete-words",
  title: "Delete Words",
  section: "Operators",
  order: 12,
  intro: [
    "Meet your first **operator**. Operators are verbs; motions are the range they act on. `d` + `w` = delete to the start of the next word. Every motion you have learned is now an edit.",
    "`daw` (delete **a word**) is usually better than `dw`: it deletes the word under the cursor plus its space, from anywhere inside the word — no need to be on the first letter.",
    "Counts multiply: `d2w` deletes two words in one command. The red highlight marks the stray text; remove it to restore the snippet.",
  ],
  keys: [
    { keys: "dw", label: "delete to next word start" },
    { keys: "daw", label: "delete a word + its space" },
    { keys: "d2w", label: "delete two words" },
  ],
  taskCount: 10,
  generators: [deleteWord("dw"), deleteWord("daw"), deleteTwoWords(), deleteChar()],
};
