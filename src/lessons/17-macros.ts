import type { Lesson } from "./types";
import { macroLines, dotRepeat } from "./gen";

export const lesson: Lesson = {
  id: "17-macros",
  title: "Macros",
  section: "Power Tools",
  order: 17,
  intro: [
    "A macro records your keystrokes and replays them. `qa` starts recording into register `a`, everything you type is captured, and `q` stops. `@a` replays the recording; `@@` repeats the last replay.",
    "The craft is making the recording **repeatable**: end it in a position where playing it again does the next piece of work — usually by finishing with `j` (down one line) or a search.",
    "Example: append `;` to five lines. Record once — `qa` `A` `;` `Esc` `j` `q` — then `4@a` finishes the rest.",
  ],
  keys: [
    { keys: "qa … q", label: "record keystrokes into register a" },
    { keys: "@a", label: "replay the macro" },
    { keys: "@@", label: "repeat the last replay" },
    { keys: "{n}@a", label: "replay n times" },
  ],
  taskCount: 8,
  generators: [macroLines("append"), macroLines("prefix"), dotRepeat()],
};
