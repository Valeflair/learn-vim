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
    "Tasks from every lesson, mixed.",
    "Prefer the shortest command over fast typing. Rerun for a new set of tasks.",
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
