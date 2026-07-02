import type { Lesson } from "./types";
import { paraJump, gotoLine, relativeJump } from "./gen";

export const lesson: Lesson = {
  id: "19-paragraph-jumps",
  title: "Paragraph Jumps",
  section: "Vertical Motions",
  order: 19,
  intro: [
    "`}` jumps forward to the next blank line, `{` backwards to the previous one. In code, blank lines separate logical blocks — so these keys hop function by function, block by block.",
    "They are coarse on purpose: use `{` `}` to get to the right neighborhood, then word motions and finds to land precisely.",
    "They are also motions, so `d}` deletes to the end of the block. Here, just travel: land on the highlighted blank line.",
  ],
  keys: [
    { keys: "}", label: "next blank line" },
    { keys: "{", label: "previous blank line" },
  ],
  taskCount: 8,
  generators: [paraJump(), gotoLine(), relativeJump()],
};
