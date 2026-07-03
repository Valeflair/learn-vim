import type { Lesson } from "./types";
import { insertMissing, typeFresh } from "./gen";

export const lesson: Lesson = {
  id: "04-insert-mode",
  title: "Insert Mode",
  section: "Basics",
  order: 4,
  intro: [
    "`i` inserts before the cursor, `a` after it.",
    "The dashed green box marks missing text. Move there, insert, type what it shows, then press `Esc`.",
  ],
  keys: [
    { keys: "i", label: "insert before the cursor" },
    { keys: "a", label: "insert after the cursor" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 8,
  generators: [insertMissing(), typeFresh()],
};
