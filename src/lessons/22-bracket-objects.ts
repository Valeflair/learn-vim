import type { Lesson } from "./types";
import { deleteInsidePair, changeInsidePair, deleteAroundPair } from "./gen";

export const lesson: Lesson = {
  id: "22-bracket-objects",
  title: "Bracket Pairs",
  section: "Text Objects",
  order: 22,
  intro: [
    "**Text objects** describe a structure around the cursor instead of a direction. `di(` deletes everything **inside** the parentheses the cursor is in — the cursor can be anywhere between them.",
    "`i` means inside (content only); `a` means around (delimiters included). So `di(` empties the parens, `da(` removes them entirely. The same works for `{` braces and `[` brackets.",
    "`c` variants change instead of delete: `ci{` empties the braces and enters insert mode. In code you live inside brackets — these commands are pure gold.",
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
