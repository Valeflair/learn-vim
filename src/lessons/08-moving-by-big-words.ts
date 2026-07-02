import type { Lesson } from "./types";
import { moveBigWord, moveWordStart, moveWordEnd } from "./gen";

export const lesson: Lesson = {
  id: "08-moving-by-big-words",
  title: "Moving by WORDs",
  section: "Essential Motions",
  order: 8,
  intro: [
    "Capital `W`, `E`, and `B` move by **WORDs**: chunks separated only by whitespace. Where lowercase `w` stops at every dot and bracket in `cart.filter(x)`, `W` treats the whole thing as one hop.",
    "Use lowercase when you want precision inside an expression, uppercase when you want to fly over it. In dense code the difference is several keystrokes per jump.",
    "These tasks mix both: notice when the highlighted cell is easier to reach with `W` than with a series of `w`s.",
  ],
  keys: [
    { keys: "W", label: "start of next WORD" },
    { keys: "B", label: "start of previous WORD" },
    { keys: "E", label: "end of WORD ahead" },
  ],
  taskCount: 8,
  generators: [moveBigWord(), moveWordStart(), moveWordEnd()],
};
