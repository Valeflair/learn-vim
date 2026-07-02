import type { Lesson } from "./types";
import { visualDeleteLines, visualDeleteSpan } from "./gen";

export const lesson: Lesson = {
  id: "26-visual-line",
  title: "Visual Line Mode",
  section: "Visual Mode",
  order: 26,
  intro: [
    "`V` (capital) selects **whole lines**. `j` and `k` extend the selection line by line — perfect when the unit of work is lines, not characters.",
    "This is the everyday way to grab a block: `V`, a few `j`s, then `d` to delete or `y` to yank. The selection can never end mid-line, so there is nothing to get wrong.",
    "Combine with counts or `}`: `V}` selects to the end of the paragraph. Here: select exactly the highlighted lines and delete them.",
  ],
  keys: [
    { keys: "V", label: "start line-wise selection" },
    { keys: "j / k", label: "extend the selection" },
    { keys: "d", label: "delete selected lines" },
  ],
  taskCount: 8,
  generators: [visualDeleteLines(), visualDeleteSpan()],
};
