import type { Lesson } from "./types";
import { macroLines, LIST_SNIPPETS } from "./gen";

export const lesson: Lesson = {
  id: "29-macros",
  title: "Macros",
  section: "Power Tools",
  order: 29,
  intro: [
    "`qa` records your keystrokes into register `a`, `q` stops, `@a` plays them back, `@@` repeats the last playback.",
    "Finish the recording with `j` so each playback continues on the next line. Edit the first line while recording, then replay for the rest.",
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
