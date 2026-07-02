import type { Lesson } from "./types";
import {
  gridMove,
  moveWordStart,
  findChar,
  deleteWord,
  changeWord,
  deleteLine,
  deleteToEnd,
  insertMissing,
  appendEnd,
  openLine,
  deleteInsidePair,
  dotRepeat,
} from "./gen";

export const lesson: Lesson = {
  id: "30-capstone",
  title: "Capstone Review",
  section: "Power Tools",
  order: 30,
  intro: [
    "Everything, mixed: motions, small edits, operators, insert commands, and text objects — whatever the drill deals you.",
    "Do not aim for speed first. Aim for the **right** command: the fix that takes one motion and one operator instead of five keys of improvisation. Speed follows accuracy.",
    "Rerun this drill whenever you come back to practice; the tasks are different every time. Beat your best time and your best keystroke count.",
  ],
  keys: [
    { keys: "…", label: "everything you have learned" },
  ],
  taskCount: 12,
  generators: [
    gridMove(),
    moveWordStart(),
    findChar("f"),
    deleteWord("daw"),
    changeWord("ciw"),
    deleteLine(),
    deleteToEnd(),
    insertMissing(),
    appendEnd(),
    openLine("o"),
    deleteInsidePair('"'),
    dotRepeat(),
  ],
};
