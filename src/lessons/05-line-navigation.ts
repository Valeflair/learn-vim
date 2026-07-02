import type { Lesson } from "./types";
import { moveLineEdge, moveWordStart, moveWordEnd } from "./gen";

export const lesson: Lesson = {
  id: "05-line-navigation",
  title: "Line Navigation",
  section: "Motions",
  order: 5,
  intro: [
    "Three keys move you within a line instantly. `0` jumps to column zero — the absolute start of the line. `$` jumps to the last character.",
    "`^` jumps to the first **non-blank** character, which is what you usually want in indented code: `0` would land you on the leading spaces, `^` lands you on the code.",
    "These pair beautifully with what comes later: `d$` deletes to the end of the line, `A` is really just `$` + `a`.",
  ],
  keys: [
    { keys: "0", label: "start of line (column zero)" },
    { keys: "^", label: "first non-blank character" },
    { keys: "$", label: "end of line" },
  ],
  taskCount: 10,
  generators: [
    moveLineEdge("0"),
    moveLineEdge("^"),
    moveLineEdge("$"),
    moveWordStart(),
    moveWordEnd(),
  ],
};
