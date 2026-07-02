import type { Lesson } from "./types";
import { tillChar, findChar } from "./gen";

export const lesson: Lesson = {
  id: "11-till-character",
  title: "Till Character",
  section: "Essential Motions",
  order: 11,
  intro: [
    "`t` works like `f` but stops one character before the target. `T` searches backwards. `;` and `,` repeat as usual.",
    "Useful with operators: `dt)` deletes up to the closing paren without eating it.",
  ],
  keys: [
    { keys: "t{char}", label: "move till just before next {char}" },
    { keys: "T{char}", label: "move back till just after {char}" },
    { keys: ";", label: "repeat the last find or till" },
  ],
  taskCount: 10,
  generators: [tillChar("t"), tillChar("T"), findChar("f")],
};
