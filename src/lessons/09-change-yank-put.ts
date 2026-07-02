import type { Lesson } from "./types";
import { changeWord, duplicateLine, swapLines, deleteChar, deleteLine } from "./gen";

export const lesson: Lesson = {
  id: "09-change-yank-put",
  title: "Change, Yank, Put",
  section: "Editing",
  order: 9,
  intro: [
    "`c` is the **change** operator: it deletes like `d`, then drops you straight into insert mode. `cw` wipes the word under the cursor and lets you type its replacement in one move — the single most-used edit in Vim.",
    "`y` is **yank** (copy) and `p` is **put** (paste after the cursor or line). `yy` yanks the whole line; `yyp` duplicates it.",
    "Here is the classic trick: everything you delete is also yanked. `dd` then `p` cuts a line and pastes it below the cursor — so `ddp` swaps a line with the one beneath it.",
  ],
  keys: [
    { keys: "cw", label: "change word: delete it, enter insert mode" },
    { keys: "yy", label: "yank (copy) the line" },
    { keys: "p", label: "put (paste) below / after" },
    { keys: "ddp", label: "swap line with the one below" },
  ],
  taskCount: 10,
  generators: [changeWord(), duplicateLine(), swapLines(), deleteChar(), deleteLine()],
};
