import type { Lesson } from "./types";
import { visualDeleteLines, visualDeleteSpan } from "./gen";

export const lesson: Lesson = {
  id: "26-visual-line",
  title: "Visual Line Mode",
  section: "Visual Mode",
  order: 26,
  intro: [
    "`V` selects whole lines; `j` and `k` extend the selection. It cannot end mid-line.",
    "Select exactly the marked lines and delete them with `d`.",
  ],
  keys: [
    { keys: "V", label: "start line-wise selection" },
    { keys: "j / k", label: "extend the selection" },
    { keys: "d", label: "delete selected lines" },
  ],
  taskCount: 8,
  generators: [visualDeleteLines(), visualDeleteSpan()],
};
