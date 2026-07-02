import type { Lesson } from "./types";
import { deleteWord, deleteTwoWords, deleteChar } from "./gen";

export const lesson: Lesson = {
  id: "12-delete-words",
  title: "Delete Words",
  section: "Operators",
  order: 12,
  intro: [
    "`d` plus a motion deletes that range: `dw` deletes to the next word start, `d2w` two words.",
    "`daw` deletes the word under the cursor plus one space and works from anywhere inside the word. Delete the red text to restore the snippet.",
  ],
  keys: [
    { keys: "dw", label: "delete to next word start" },
    { keys: "daw", label: "delete a word + its space" },
    { keys: "d2w", label: "delete two words" },
  ],
  taskCount: 10,
  generators: [deleteWord("dw"), deleteWord("daw"), deleteTwoWords(), deleteChar()],
};
