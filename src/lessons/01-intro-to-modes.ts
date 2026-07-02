import type { Lesson } from "./types";
import { typeFresh, insertMissing } from "./gen";

export const lesson: Lesson = {
  id: "01-intro-to-modes",
  title: "Intro to Modes",
  section: "Basics",
  order: 1,
  intro: [
    "Vim is a modal editor: the same keys do different things depending on the mode. You start in **normal mode**, where keys are commands, not text. Press `i` to enter **insert mode**, where typing works like any other editor.",
    "`Esc` always brings you back to normal mode. That round trip — `i`, type, `Esc` — is the heartbeat of Vim; you will do it thousands of times, so let it become reflex now.",
    "The badge under the editor shows the current mode. A task counts as done only once you are back in normal mode.",
  ],
  keys: [
    { keys: "i", label: "enter insert mode before the cursor" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 6,
  generators: [typeFresh(), insertMissing()],
};
