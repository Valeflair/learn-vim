import type { Lesson } from "./types";
import { findChar, moveLineEdge, moveWordStart } from "./gen";

export const lesson: Lesson = {
  id: "06-find-on-line",
  title: "Find on the Line",
  section: "Motions",
  order: 6,
  intro: [
    "`f` followed by any character jumps the cursor forward **onto** the next occurrence of that character on the line. `f(` takes you straight to the next opening paren — one hop, no counting words.",
    "`t` (till) stops one character **before** the match, which is exactly what operators want: `dt)` deletes up to but not including the closing paren. `F` searches backward instead of forward.",
    "Missed it by one occurrence? `;` repeats the last find in the same direction, `,` repeats it the opposite way. `f,;;` walks you occurrence by occurrence down the line.",
  ],
  keys: [
    { keys: "f{char}", label: "jump onto the next {char}" },
    { keys: "t{char}", label: "jump till just before {char}" },
    { keys: "F{char}", label: "jump back onto previous {char}" },
    { keys: "; / ,", label: "repeat find, same / opposite direction" },
  ],
  taskCount: 10,
  generators: [findChar("f"), findChar("t"), findChar("F"), moveLineEdge("$"), moveWordStart()],
};
