import type { Lesson } from "./types";
import { findChar } from "./gen";

export const lesson: Lesson = {
  id: "10-find-character",
  title: "Find Character",
  section: "Essential Motions",
  order: 10,
  intro: [
    "`f` plus a character moves onto the next occurrence of that character in the line. `F` searches backwards. `;` repeats the jump, `,` reverses it.",
    "Use it to reach punctuation directly: aim at the paren or comma instead of walking there word by word.",
  ],
  keys: [
    { keys: "f{char}", label: "jump onto next {char} in line" },
    { keys: "F{char}", label: "jump back onto previous {char}" },
    { keys: ";", label: "repeat the last find" },
  ],
  taskCount: 10,
  generators: [findChar("f"), findChar("F")],
};
