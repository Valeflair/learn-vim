import type { Lesson } from "./types";
import { dotRepeat, joinLines, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "16-repeat-and-join",
  title: "Repeat & Join",
  section: "Operators",
  order: 16,
  intro: [
    "`.` repeats the last change, motion included: delete a word with `dw`, move elsewhere, press `.` to delete another.",
    "`J` joins the next line onto the current one with a single space.",
  ],
  keys: [
    { keys: ".", label: "repeat the last change" },
    { keys: "J", label: "join line below onto this one" },
  ],
  taskCount: 8,
  generators: [dotRepeat(), joinLines(), deleteLine()],
};
