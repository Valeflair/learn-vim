import { describe, it, expect, beforeEach } from "vitest";
import { createEditor } from "../src/engine/editor";
import {
  mulberry32,
  SNIPPETS,
  moveWordStart,
  moveWordEnd,
  moveBigWord,
  moveLineEdge,
  gotoLine,
  findChar,
  tillChar,
  paraJump,
  searchWord,
  deleteInsidePair,
  deleteAroundPair,
  deleteInsidePara,
  deleteAroundPara,
} from "../src/lessons/gen";
import type { Cursor, Task, TaskGen } from "../src/lessons/types";

// Drives a generator's keyHint through the real CodeMirror+vim engine and
// confirms it actually reaches targetText/targetCursor from startCursor —
// the structural checks in lessons.test.ts never press a single key.
//
// Only generators whose keyHint is a complete, literal key sequence from
// startCursor are covered here. Several generators (deleteChar, deleteLine,
// duplicateLine, visual-mode spans, macros, `/search`, anything that enters
// insert mode) leave real navigation or text typing to the player and can't
// be replayed from a fixed startCursor, or rely on typing text into insert
// mode / a search dialog, which jsdom can't synthesize (see lesson-view.test.ts).
// relativeJump is skipped too: it hinges on real j/k display motions, which
// editor.test.ts already documents as unreliable in jsdom.

let parent: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = "";
  parent = document.createElement("div");
  document.body.appendChild(parent);
});

function press(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

/** Splits a keyHint into space-separated tokens and presses each character. */
function playKeyHint(target: Element, hint: string) {
  for (const token of hint.split(" ")) {
    for (const ch of token) press(target, ch);
  }
}

function cursorEq(a: Cursor, b: Cursor): boolean {
  return a.line === b.line && a.col === b.col;
}

/**
 * moveWordStart/End and moveBigWord's keyHint is a single key (w/b/e/W/E/B)
 * that the player repeats as many times as needed — the hint doesn't encode
 * a hop count. Replay it until the cursor lands on target, capped generously.
 */
function hopUntil(getCursor: () => Cursor, target: Element, key: string, goal: Cursor, cap = 40) {
  for (let i = 0; i < cap && !cursorEq(getCursor(), goal); i++) {
    press(target, key);
  }
}

function forEachTask(gen: TaskGen, run: (task: Task) => void) {
  for (let seed = 1; seed <= 5; seed++) {
    SNIPPETS.forEach((snippet, si) => {
      const rng = mulberry32(seed * 97 + si * 31);
      let task: Task;
      try {
        task = gen(rng, snippet);
      } catch {
        return; // no candidate in this snippet/seed combo
      }
      run(task);
    });
  }
}

const SINGLE_SHOT_MOTION_GENERATORS: [string, TaskGen][] = [
  ["moveLineEdge 0", moveLineEdge("0")],
  ["moveLineEdge ^", moveLineEdge("^")],
  ["moveLineEdge $", moveLineEdge("$")],
  ["gotoLine", gotoLine()],
  ["findChar f", findChar("f")],
  ["findChar F", findChar("F")],
  ["tillChar t", tillChar("t")],
  ["tillChar T", tillChar("T")],
  ["paraJump", paraJump()],
  ["searchWord *", searchWord("*")],
  ["searchWord #", searchWord("#")],
];

describe("generator keyHint reachability: single-shot motions", () => {
  for (const [label, gen] of SINGLE_SHOT_MOTION_GENERATORS) {
    it(`${label}: keyHint lands the cursor on targetCursor`, () => {
      forEachTask(gen, (task) => {
        const ed = createEditor({ parent, doc: task.startText, cursor: task.startCursor });
        ed.focus();
        playKeyHint(parent.querySelector(".cm-content")!, task.keyHint!);
        expect(ed.getText(), label).toBe(task.targetText);
        expect(ed.getCursor(), label).toEqual(task.targetCursor);
        ed.destroy();
      });
    }, 20000);
  }
});

const HOPPING_MOTION_GENERATORS: [string, TaskGen][] = [
  ["moveWordStart", moveWordStart()],
  ["moveWordEnd", moveWordEnd()],
  ["moveBigWord", moveBigWord()],
];

describe("generator keyHint reachability: repeated-hop motions", () => {
  for (const [label, gen] of HOPPING_MOTION_GENERATORS) {
    it(`${label}: repeating the keyHint key lands on targetCursor`, () => {
      forEachTask(gen, (task) => {
        const ed = createEditor({ parent, doc: task.startText, cursor: task.startCursor });
        ed.focus();
        const target = parent.querySelector(".cm-content")!;
        hopUntil(() => ed.getCursor(), target, task.keyHint!, task.targetCursor!);
        expect(ed.getText(), label).toBe(task.targetText);
        expect(ed.getCursor(), label).toEqual(task.targetCursor);
        ed.destroy();
      });
    }, 20000);
  }
});

const TEXT_OBJECT_GENERATORS: [string, TaskGen][] = [
  ["deleteInsidePair \"", deleteInsidePair('"')],
  ["deleteInsidePair (", deleteInsidePair("(")],
  ["deleteInsidePair {", deleteInsidePair("{")],
  ["deleteInsidePair [", deleteInsidePair("[")],
  ["deleteAroundPair \"", deleteAroundPair('"')],
  ["deleteAroundPair (", deleteAroundPair("(")],
  ["deleteAroundPair [", deleteAroundPair("[")],
  ["deleteInsidePara", deleteInsidePara()],
  ["deleteAroundPara", deleteAroundPara()],
];

describe("generator keyHint reachability: text objects", () => {
  for (const [label, gen] of TEXT_OBJECT_GENERATORS) {
    it(`${label}: keyHint reaches targetText from its preset cursor`, () => {
      forEachTask(gen, (task) => {
        const ed = createEditor({ parent, doc: task.startText, cursor: task.startCursor });
        ed.focus();
        playKeyHint(parent.querySelector(".cm-content")!, task.keyHint!);
        expect(ed.getText(), label).toBe(task.targetText);
        ed.destroy();
      });
    }, 20000);
  }
});
