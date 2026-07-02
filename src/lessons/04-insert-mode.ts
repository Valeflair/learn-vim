import type { Lesson } from "./types";
import { insertMissing, typeFresh, moveWordStart } from "./gen";

export const lesson: Lesson = {
  id: "04-insert-mode",
  title: "Insert Mode",
  section: "Basics",
  order: 4,
  intro: [
    "`i` inserts **before** the cursor, `a` (append) inserts **after** it. The distinction matters at every edit: to add text at the exact cursor position use `i`; to continue behind the current character use `a`.",
    "The green dashed ghost box shows text that is missing from the snippet. Navigate to it with the motions you already know, enter insert mode, type exactly what the ghost shows, and press `Esc`.",
    "Tip: most Vim users remap Caps Lock to Esc — the pinky reach to the real Esc key is the only bad part of this workflow.",
  ],
  keys: [
    { keys: "i", label: "insert before the cursor" },
    { keys: "a", label: "insert after the cursor" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 8,
  generators: [insertMissing(), typeFresh(), moveWordStart()],
};
