import type { Lesson } from "./types";
import { findChar, moveLineEdge } from "./gen";

export const lesson: Lesson = {
  id: "10-find-character",
  title: "Find Character",
  section: "Essential Motions",
  order: 10,
  intro: [
    "`f` + any character jumps the cursor **onto** the next occurrence of that character in the line. `F` searches backwards. It only looks within the current line — if the character is not there, the cursor stays put.",
    "`;` repeats the last find in the same direction, `,` in the opposite one. So `f,` `;` `;` walks you comma by comma through an argument list.",
    "This is the fastest way to reach punctuation: parens, quotes, commas, equals signs. Aim for the character, not the word around it.",
  ],
  keys: [
    { keys: "f{char}", label: "jump onto next {char} in line" },
    { keys: "F{char}", label: "jump back onto previous {char}" },
    { keys: ";", label: "repeat the last find" },
  ],
  taskCount: 10,
  generators: [findChar("f"), findChar("F"), moveLineEdge("$")],
};
