import type { Lesson } from "./types";
import { deleteTwoWords, deleteWord, dotRepeat, changeWord, deleteToEnd } from "./gen";

export const lesson: Lesson = {
  id: "10-operator-grammar",
  title: "Operator Grammar",
  section: "Editing",
  order: 10,
  intro: [
    "Vim commands follow a grammar: **operator + count + motion**. `d2w` reads \"delete two words\". Any operator combines with any motion you know: `d$`, `c3w`, `y}` — you never memorized those, you composed them.",
    "`daw` is \"delete **a word**\" — a text object that grabs the word plus its surrounding space no matter where inside it your cursor sits. Compare with `dw`, which only deletes from the cursor forward.",
    "The `.` key repeats your last change. Delete a word with `dw`, move somewhere else, press `.` — the same deletion happens again. One well-chosen edit plus `.` beats retyping every time.",
  ],
  keys: [
    { keys: "d{n}w", label: "delete n words" },
    { keys: "daw", label: "delete a word (from anywhere inside it)" },
    { keys: ".", label: "repeat the last change" },
  ],
  taskCount: 10,
  generators: [deleteTwoWords(), deleteWord("daw"), dotRepeat(), changeWord(), deleteToEnd()],
};
