import type { Lesson } from "./types";
import { deleteInsidePair, changeInsidePair, deleteAroundPair } from "./gen";

export const lesson: Lesson = {
  id: "22-bracket-objects",
  title: "Bracket Pairs",
  section: "Text Objects",
  order: 22,
  intro: [
    "Text objects select by structure instead of direction. `di(` deletes everything inside the surrounding parens; the cursor can be anywhere between them.",
    "`i` means inside, `a` includes the delimiters, and `c` changes instead of deleting. `{` and `[` work the same way.",
  ],
  keys: [
    { keys: "di(", label: "delete inside parentheses" },
    { keys: "ci{", label: "change inside braces" },
    { keys: "da[", label: "delete around brackets" },
  ],
  taskCount: 10,
  generators: [
    deleteInsidePair("("),
    deleteInsidePair("{"),
    deleteInsidePair("["),
    changeInsidePair("("),
    deleteAroundPair("("),
  ],
};
