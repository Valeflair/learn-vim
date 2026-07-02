import type { Lesson } from "./types";
import { deleteInside, deleteAround, changeInside, deleteWord } from "./gen";

export const lesson: Lesson = {
  id: "13-text-objects",
  title: "Text Objects",
  section: "Search & Objects",
  order: 13,
  intro: [
    "Text objects describe **structures**: a quoted string, a parenthesized group, a bracketed list. `di\"` deletes everything **inside** the nearest quotes — and your cursor only needs to be anywhere within them.",
    "`i` means *inner* (contents only) and `a` means *around* (contents plus the delimiters): `di(` empties the parens, `da(` removes them entirely.",
    "Combined with `c` they shine in code: `ci\"` clears a string and puts you in insert mode inside the quotes, ready to type the new value.",
  ],
  keys: [
    { keys: 'di" / di( / di[', label: "delete inside quotes / parens / brackets" },
    { keys: "da(", label: "delete around: contents plus the parens" },
    { keys: 'ci"', label: "change inside quotes: clear and insert" },
  ],
  taskCount: 10,
  generators: [
    deleteInside('"'),
    deleteInside("("),
    deleteInside("["),
    deleteAround(),
    changeInside(),
    deleteWord("daw"),
  ],
};
