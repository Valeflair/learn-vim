import type { Lesson } from "./types";
import { typeFresh, insertMissing } from "./gen";

export const lesson: Lesson = {
  id: "01-intro-to-modes",
  title: "Intro to Modes",
  section: "Basics",
  order: 1,
  intro: [
    "Vim has modes. In normal mode every key is a command. `i` switches to insert mode, where typing inserts text, and `Esc` returns to normal mode.",
    "The badge under the editor shows the current mode. A task only counts once you are back in normal mode.",
  ],
  keys: [
    { keys: "i", label: "enter insert mode before the cursor" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 6,
  generators: [typeFresh(), insertMissing()],
};
