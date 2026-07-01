import type { Lesson } from "./types";

export const lesson: Lesson = {
  id: "15-registers",
  title: "Registers (\"a \"0 \"_)",
  section: "Power features",
  order: 15,
  steps: [
    {
      kind: "explanation",
      text: "Every yank and delete lands in the **unnamed register**, which `p` pastes. Prefix with `\"{letter}` to use a named register instead: `\"ayy` yanks a line into `a`, `\"ap` pastes it. Yanks also copy into register `0`, which deletes never touch — `\"0p` recovers your last yank after a delete clobbered the unnamed register. `\"_` is the black hole: `\"_dd` deletes without touching any register.",
    },
    {
      kind: "challenge",
      id: "15-named",
      instruction: "Yank `alpha` into register `a` (`\"ayy`), move down, then paste it below `beta` with `\"ap`.",
      startText: "alpha\nbeta",
      startCursor: { line: 0, col: 0 },
      targetText: "alpha\nbeta\nalpha",
      par: 8,
      hint: '"ayy j "ap',
    },
    {
      kind: "challenge",
      id: "15-yank-reg",
      instruction: "Yank line 1, delete line 2 with `dd`, then paste the **yank** (not the delete) below using `\"0p`.",
      startText: "paste me\ndelete me",
      startCursor: { line: 0, col: 0 },
      targetText: "paste me\npaste me",
      par: 8,
      hint: 'yy j dd "0p',
    },
    {
      kind: "challenge",
      id: "15-blackhole",
      instruction: "Yank line 1, black-hole-delete line 2 with `\"_dd`, then paste with plain `p` — the yank survived.",
      startText: "good line\ntrash line",
      startCursor: { line: 0, col: 0 },
      targetText: "good line\ngood line",
      par: 8,
      hint: 'yy j "_dd p',
    },
  ],
};
