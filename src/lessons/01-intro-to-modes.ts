import type { Lesson } from "./types";
import { typeFresh, insertMissing } from "./gen";

export const lesson: Lesson = {
  id: "01-intro-to-modes",
  title: "Intro to Modes",
  section: "Basics",
  order: 1,
  intro: [
    "Vim is a modal editor. In **normal mode** every key is a command; in **insert mode** keys type text, like a regular editor. You start in normal mode, and you will spend most of your time there.",
    "Press `i` to start inserting text **before** the cursor. Press `Esc` to leave insert mode and return to normal mode. Watch the mode indicator under the editor: it tells you which mode you are in at all times.",
    "The habit to build: get in, type, get out. Vim rewards short bursts of insertion surrounded by powerful normal-mode commands.",
  ],
  keys: [
    { keys: "i", label: "insert text before the cursor" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 6,
  generators: [typeFresh(), insertMissing()],
};
