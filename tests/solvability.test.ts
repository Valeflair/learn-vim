import { describe, it, expect, beforeEach } from "vitest";
import { lessons } from "../src/lessons/index";
import { createEditor } from "../src/engine/editor";
import type { Challenge } from "../src/lessons/types";

// Optimal solutions replayed through the real vim editor. Challenges whose
// solution needs insert-mode typing or the search panel can't be driven by
// synthetic keydown events in jsdom, and vertical motions (j/k) rely on
// display-line geometry that jsdom can't measure — those are verified
// manually in the browser instead.
const SOLUTIONS: Record<string, string> = {
  "02-right": "llll",
  "04-w": "ww",
  "04-e": "eeee",
  "04-b": "bbbb",
  "04-ge": "ge",
  "04-W": "WW",
  "05-dollar": "$",
  "05-zero": "0",
  "05-caret": "^",
  "05-G": "G",
  "05-gg": "gg",
  "05-nG": "6G",
  "06-f-equals": "f=",
  "06-f-semi": "f;",
  "06-second-o": "fo;",
  "06-t-quote": 't"',
  "06-F-paren": "F(",
  "06-third-n": "fn;;",
  "07-brace-down": "}",
  "07-brace-down2": "}}",
  "07-brace-up": "{{",
  "08-x": "x",
  "08-3x": "3x",
  "08-dw": "dw",
  "08-dd": "dd",
  "08-2dd": "2dd",
  "08-D": "D",
  "08-d3w": "d3w",
  "09-yyp": "yyp",
  "09-ddp": "ddp",
  "10-d-dollar": "d$",
  "10-df-paren": "df)",
  "11-r": "ra",
  "11-tilde": "~~~",
  "11-J": "J",
  "12-star": "*",
  "12-hash": "#",
  "13-diw": "diw",
  "13-daw": "daw",
  "13-da-paren": "da(",
  "13-dip": "dip",
  "14-v-d": "veed",
  "15-named": '"ayyj"ap',
  "15-yank-reg": 'yyjdd"0p',
  "15-blackhole": 'yyj"_ddp',
  "16-tick": "Gmbgg'b",
  "16-exact": "magg`al",
  "18-quote-fix": "f'r\"f'r\"",
};

type Key = { key: string; ctrlKey?: boolean };

function tokenize(solution: string): Key[] {
  const tokens = solution.match(/<[^>]+>|./g) ?? [];
  return tokens.map((t) => {
    if (t === "<Esc>") return { key: "Escape" };
    const ctrl = t.match(/^<C-(.+)>$/);
    if (ctrl) return { key: ctrl[1], ctrlKey: true };
    return { key: t };
  });
}

const allChallenges: Challenge[] = lessons.flatMap((l) =>
  l.steps.filter((s): s is Challenge => s.kind === "challenge"),
);

let parent: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = "";
  parent = document.createElement("div");
  document.body.appendChild(parent);
});

describe("challenge solvability (normal-mode solutions)", () => {
  for (const [id, solution] of Object.entries(SOLUTIONS)) {
    it(`${id}: "${solution}" reaches the target at par`, () => {
      const c = allChallenges.find((ch) => ch.id === id);
      expect(c, `challenge ${id} exists`).toBeDefined();

      expect(tokenize(solution).length, `${id} par matches solution length`).toBe(c!.par);

      const ed = createEditor({ parent, doc: c!.startText, cursor: c!.startCursor });
      ed.focus();
      const target = parent.querySelector(".cm-content")!;
      for (const k of tokenize(solution)) {
        target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...k }));
      }
      expect(ed.getText()).toBe(c!.targetText);
      if (c!.targetCursor) expect(ed.getCursor()).toEqual(c!.targetCursor);
      ed.destroy();
    });
  }
});
