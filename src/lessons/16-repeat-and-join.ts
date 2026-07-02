import type { Lesson } from "./types";
import { dotRepeat, joinLines, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "16-repeat-and-join",
  title: "Repeat & Join",
  section: "Operators",
  order: 16,
  intro: [
    "`.` (the dot) repeats your last **change** — the whole thing, operator and range. Delete a word with `dw`, move somewhere else, press `.` and Vim deletes a word there too.",
    "This turns repetitive cleanups into a rhythm: one careful edit, then motion–dot, motion–dot. The best Vim users think in dot-repeatable edits.",
    "`J` joins the line below onto the current one with a single space. A sentence split across two lines becomes whole again with one keypress.",
  ],
  keys: [
    { keys: ".", label: "repeat the last change" },
    { keys: "J", label: "join line below onto this one" },
  ],
  taskCount: 8,
  generators: [dotRepeat(), joinLines(), deleteLine()],
};
