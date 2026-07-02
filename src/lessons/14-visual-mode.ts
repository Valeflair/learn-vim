import type { Lesson } from "./types";
import { visualDeleteLines, visualDeleteSpan, deleteInside, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "14-visual-mode",
  title: "Visual Mode",
  section: "Search & Objects",
  order: 14,
  intro: [
    "Sometimes you want to **see** the selection before you act on it. `v` starts visual mode: every motion now extends a highlighted selection. When it covers what you want, press an operator — `d` deletes it, `y` yanks it.",
    "`V` selects whole **lines** at a time: `Vjj` grabs three lines, `d` removes them. For multi-line surgery it is often clearer than counting for `3dd`.",
    "`Esc` abandons a selection. Visual mode is a great fallback whenever composing the perfect operator + motion feels hard.",
  ],
  keys: [
    { keys: "v", label: "start character-wise selection" },
    { keys: "V", label: "start line-wise selection" },
    { keys: "d / y", label: "delete / yank the selection" },
    { keys: "Esc", label: "cancel the selection" },
  ],
  taskCount: 10,
  generators: [visualDeleteLines(), visualDeleteSpan(), deleteInside('"'), deleteLine()],
};
