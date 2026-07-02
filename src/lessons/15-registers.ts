import type { Lesson } from "./types";
import { copyLineBelow, moveLineBelow, duplicateLine, swapLines } from "./gen";

export const lesson: Lesson = {
  id: "15-registers",
  title: "Moving Text Around",
  section: "Power Tools",
  order: 15,
  intro: [
    "Yank and delete both fill a **register** — Vim's clipboard — and `p` empties it wherever you are. That makes copy and move two sides of the same workflow: `yy` + travel + `p` copies a line, `dd` + travel + `p` moves it.",
    "The register survives any amount of movement in between, so take the scenic route: search, `gg`, `12G` — the text stays with you until you put it.",
    "These drills say things like \"move line 2 below line 5\". Cut or copy first, navigate second, paste last.",
  ],
  keys: [
    { keys: "yy … p", label: "copy a line somewhere else" },
    { keys: "dd … p", label: "move a line somewhere else" },
    { keys: "p / P", label: "put below-after / above-before" },
  ],
  taskCount: 10,
  generators: [copyLineBelow(), moveLineBelow(), duplicateLine(), swapLines()],
};
