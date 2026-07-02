import type { Lesson } from "./types";
import { moveLineEdge, moveBigWord } from "./gen";

export const lesson: Lesson = {
  id: "09-line-ends",
  title: "Moving to Line Ends",
  section: "Essential Motions",
  order: 9,
  intro: [
    "`0` jumps to the very first column of the line; `$` to the last character. Between them sits `^`: the first **non-blank** character, which in indented code is almost always where you actually want to go.",
    "These are instant, no matter how long the line is. Combined with `j`/`k` they make a grid: line up or down, then snap to an edge.",
    "Later these pay double: operators take them as ranges (`d$` deletes to the end of the line). Learn the motion now, get the operator for free.",
  ],
  keys: [
    { keys: "0", label: "first column of the line" },
    { keys: "^", label: "first non-blank character" },
    { keys: "$", label: "end of the line" },
  ],
  taskCount: 10,
  generators: [moveLineEdge("0"), moveLineEdge("^"), moveLineEdge("$"), moveBigWord()],
};
