import type { Lesson } from "./types";
import {
  deleteChar,
  deleteWord,
  changeWord,
  appendEnd,
  deleteInside,
  visualDeleteLines,
  dotRepeat,
  copyLineBelow,
  findChar,
  gotoLine,
  macroLines,
  replaceChar,
} from "./gen";

export const lesson: Lesson = {
  id: "18-capstone",
  title: "Capstone",
  section: "Power Tools",
  order: 18,
  intro: [
    "Everything at once. This drill mixes motions, operators, text objects, visual mode, the dot command, registers, and macros — the way real editing does.",
    "There is no single right answer to any task. `daw`, `viwd`, and `dw` can all do the same job; what matters is reaching for a structured edit instead of hammering `x`.",
    "Run it more than once: the tasks are randomized every time, and your best time and keystroke count are saved.",
  ],
  keys: [
    { keys: "operators", label: "d, c, y + any motion" },
    { keys: "objects", label: 'iw, aw, i", i(, i[' },
    { keys: "power", label: ". , registers, marks, macros" },
  ],
  taskCount: 12,
  generators: [
    deleteChar(),
    deleteWord("dw"),
    changeWord(),
    appendEnd(),
    deleteInside('"'),
    visualDeleteLines(),
    dotRepeat(),
    copyLineBelow(),
    findChar("f"),
    gotoLine(),
    macroLines("append"),
    replaceChar(),
  ],
};
