import type { Lesson } from "./types";
import { macroLines, LIST_SNIPPETS } from "./gen";

export const lesson: Lesson = {
  id: "29-macros",
  title: "Macros",
  section: "Power Tools",
  order: 29,
  intro: [
    "A **macro** records keystrokes and replays them. `qa` starts recording into register `a`, `q` stops, `@a` replays. Whatever you did — motions, edits, mode changes — happens again exactly.",
    "The craft is making the recording **repeatable**: end it in a position where replaying makes sense, usually by finishing with a `j` to step to the next line. Then `@a` `@a` `@a` marches down the file. `@@` repeats the last replay.",
    "Record the edit for the first line once, then replay it for the rest. If a recording goes wrong, `q` to stop, then just record `qa` again.",
  ],
  keys: [
    { keys: "qa … q", label: "record keystrokes into register a" },
    { keys: "@a", label: "replay the macro" },
    { keys: "@@", label: "repeat the last replay" },
  ],
  taskCount: 6,
  generators: [macroLines("append"), macroLines("prefix")],
  snippets: LIST_SNIPPETS,
};
