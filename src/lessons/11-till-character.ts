import type { Lesson } from "./types";
import { tillChar, findChar } from "./gen";

export const lesson: Lesson = {
  id: "11-till-character",
  title: "Till Character",
  section: "Essential Motions",
  order: 11,
  intro: [
    "`t` (till) is `f`'s careful sibling: it stops **just before** the target character. `T` searches backwards and stops just after it.",
    "Why stop short? Because of operators: `dt)` deletes everything up to — but not including — the closing paren. That is the edit you want far more often than eating the paren too.",
    "`;` and `,` repeat till-motions exactly like find-motions. Practice both here; the green cell tells you whether `f` or `t` lands on it.",
  ],
  keys: [
    { keys: "t{char}", label: "move till just before next {char}" },
    { keys: "T{char}", label: "move back till just after {char}" },
    { keys: ";", label: "repeat the last find or till" },
  ],
  taskCount: 10,
  generators: [tillChar("t"), tillChar("T"), findChar("f")],
};
