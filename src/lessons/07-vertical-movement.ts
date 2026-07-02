import type { Lesson } from "./types";
import { gotoLine, paraJump, findChar, moveLineEdge } from "./gen";

export const lesson: Lesson = {
  id: "07-vertical-movement",
  title: "Vertical Movement",
  section: "Motions",
  order: 7,
  intro: [
    "Holding `j` to cross a file is a beginner smell. `gg` jumps to the first line, `G` to the last, and a count makes `G` absolute: `12G` puts you on line 12. The line numbers in the gutter are your map.",
    "`{` and `}` jump backward and forward by **paragraph** — to the nearest blank line. In code, that means hopping between functions and blocks instead of scrolling through them.",
    "Combine: `gg` then `}` `}` walks you block by block from the top.",
  ],
  keys: [
    { keys: "gg / G", label: "first / last line" },
    { keys: "{n}G", label: "jump to line n" },
    { keys: "{ / }", label: "previous / next blank line (paragraph)" },
  ],
  taskCount: 10,
  generators: [gotoLine(), paraJump(), findChar("f"), moveLineEdge("0")],
};
