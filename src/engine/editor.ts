import {
  EditorView,
  keymap,
  gutter,
  GutterMarker,
  drawSelection,
  highlightActiveLine,
  Decoration,
  WidgetType,
} from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorState, EditorSelection, StateField } from "@codemirror/state";
import type { Range } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { vim, getCM } from "@replit/codemirror-vim";
import { formatKey } from "./keys";
import type { Cursor, TaskMark } from "../lessons/types";

export type EditorHandle = {
  getText(): string;
  getCursor(): Cursor;
  getMode(): string;
  focus(): void;
  destroy(): void;
};

export type EditorOptions = {
  parent: HTMLElement;
  doc: string;
  cursor?: Cursor;
  /** Green cell the cursor should land on (motion tasks). */
  target?: Cursor;
  /** Blue "focus" spans to act on; red/ghost highlights come from the diff. */
  marks?: TaskMark[];
  /**
   * The text the task should end at. The editor live-diffs the document
   * against it on every change: surplus text is marked red, missing text
   * shows as a green dashed ghost — solved parts disappear as you go.
   */
  targetText?: string;
  onKey?: (key: string) => void;
  onChange?: () => void;
  onModeChange?: (mode: string) => void;
};

const targetMark = Decoration.mark({ class: "lv-target" });
const targetLine = Decoration.line({ class: "lv-target-line" });
const editMark = Decoration.mark({ class: "lv-mark" });
const focusMark = Decoration.mark({ class: "lv-focus" });

class GhostWidget extends WidgetType {
  constructor(private readonly text: string) {
    super();
  }
  override eq(other: GhostWidget): boolean {
    return other.text === this.text;
  }
  override toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.className = "lv-ghost";
    el.textContent = this.text.replace(/\n/g, "⏎");
    return el;
  }
  override ignoreEvent(): boolean {
    return true;
  }
}

/**
 * Hybrid line numbers, vim-hero style: the cursor line shows its absolute
 * number (bold), every other line its distance from the cursor — exactly the
 * counts that {n}j / {n}k take.
 */
class LineNum extends GutterMarker {
  constructor(
    private readonly label: string,
    private readonly current: boolean,
  ) {
    super();
  }
  override eq(other: LineNum): boolean {
    return other.label === this.label && other.current === this.current;
  }
  override toDOM(): Node {
    const el = document.createElement("span");
    el.className = this.current ? "lv-lnr lv-lnr-current" : "lv-lnr";
    el.textContent = this.label;
    return el;
  }
}

const hybridLineNumbers = gutter({
  class: "cm-lineNumbers",
  lineMarker(view, line) {
    const doc = view.state.doc;
    const cur = doc.lineAt(view.state.selection.main.head).number;
    const n = doc.lineAt(line.from).number;
    return new LineNum(n === cur ? String(n) : String(Math.abs(n - cur)), n === cur);
  },
  lineMarkerChange: (update) => update.selectionSet,
});

function posAt(doc: EditorState["doc"], line: number, col: number): { from: number; to: number } {
  const l = doc.line(Math.min(line, doc.lines - 1) + 1);
  return { from: Math.min(l.from + col, l.to), to: l.to };
}

function taskDecorations(state: EditorState, opts: EditorOptions): DecorationSet {
  const ranges = [];
  if (opts.marks) {
    for (const m of opts.marks) {
      if (m.kind !== "focus") continue;
      const { from } = posAt(state.doc, m.line, m.from);
      const { from: to } = posAt(state.doc, m.line, m.to);
      if (from < to) ranges.push(focusMark.range(from, to));
    }
  }
  if (opts.target) {
    const { from, to } = posAt(state.doc, opts.target.line, opts.target.col);
    if (from < to) ranges.push(targetMark.range(from, from + 1));
    else ranges.push(targetLine.range(state.doc.lineAt(from).from));
  }
  return Decoration.set(ranges, true);
}

/** Longest common prefix/suffix: a[s,ea) differs from b[s,eb). */
function charDiff(a: string, b: string): [number, number, number] {
  let s = 0;
  const max = Math.min(a.length, b.length);
  while (s < max && a[s] === b[s]) s++;
  let ea = a.length;
  let eb = b.length;
  while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) {
    ea--;
    eb--;
  }
  return [s, ea, eb];
}

/**
 * What's still wrong: red marks on text the target doesn't have, ghost
 * widgets for text the document is still missing. Recomputed on every
 * change, so solved parts vanish and ghosts shrink while typing.
 */
function diffDecorations(doc: string, target: string): DecorationSet {
  if (doc === target) return Decoration.none;
  const ranges: Range<Decoration>[] = [];
  const red = (from: number, to: number) => {
    if (from < to) ranges.push(editMark.range(from, to));
  };
  const ghost = (at: number, text: string) => {
    if (text) ranges.push(Decoration.widget({ widget: new GhostWidget(text), side: 1 }).range(at));
  };

  const A = doc.split("\n");
  const B = target.split("\n");
  const offA: number[] = [0];
  for (const l of A) offA.push(offA[offA.length - 1] + l.length + 1);
  let top = 0;
  while (top < A.length && top < B.length && A[top] === B[top]) top++;
  let bot = 0;
  while (bot < A.length - top && bot < B.length - top && A[A.length - 1 - bot] === B[B.length - 1 - bot]) bot++;
  const na = A.length - top - bot;
  const nb = B.length - top - bot;

  if (na === nb) {
    // Same line count: a tight hunk per changed line.
    for (let k = 0; k < na; k++) {
      const [s, ea, eb] = charDiff(A[top + k], B[top + k]);
      red(offA[top + k] + s, offA[top + k] + ea);
      ghost(offA[top + k] + ea, B[top + k].slice(s, eb));
    }
  } else if (na === 0) {
    // Whole lines missing: ghost them at the join point.
    const text = B.slice(top, B.length - bot).join("\n");
    if (top > 0) ghost(offA[top] - 1, "\n" + text);
    else ghost(0, text + "\n");
  } else if (nb === 0) {
    // Surplus lines: all red.
    red(offA[top], offA[A.length - bot] - 1);
  } else {
    // Line counts differ both ways (join/split): one hunk over everything.
    const [s, ea, eb] = charDiff(doc, target);
    red(s, ea);
    ghost(ea, target.slice(s, eb));
  }
  return Decoration.set(ranges, true);
}

export function createEditor(opts: EditorOptions): EditorHandle {
  let mode = "normal";

  // Focus spans and the target cell survive edits by mapping through changes.
  const taskField = StateField.define<DecorationSet>({
    create: (state) => taskDecorations(state, opts),
    update: (deco, tr) => (tr.docChanged ? deco.map(tr.changes) : deco),
    provide: (f) => EditorView.decorations.from(f),
  });

  // Red junk / green ghosts: a live diff against the target text.
  const target = opts.targetText;
  const diffField =
    target === undefined
      ? []
      : StateField.define<DecorationSet>({
          create: (state) => diffDecorations(state.doc.toString(), target),
          update: (deco, tr) => (tr.docChanged ? diffDecorations(tr.newDoc.toString(), target) : deco),
          provide: (f) => EditorView.decorations.from(f),
        });

  const state = EditorState.create({
    doc: opts.doc,
    extensions: [
      vim(), // must precede other keymaps
      // Plain CSS can't override CodeMirror's injected base theme (its
      // selectors have higher specificity) — the gutter stayed bright.
      EditorView.theme(
        {
          ".cm-gutters": {
            backgroundColor: "transparent",
            color: "var(--dim)",
            border: "none",
          },
        },
        { dark: true },
      ),
      hybridLineNumbers,
      history(),
      drawSelection(),
      highlightActiveLine(),
      taskField,
      diffField,
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.domEventHandlers({
        // No mouse in vim training: clicking focuses the editor but never
        // moves the cursor or drags a selection.
        mousedown: (e, view) => {
          e.preventDefault();
          view.focus();
          return true;
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) opts.onChange?.();
      }),
    ],
  });

  const view = new EditorView({ state, parent: opts.parent });

  // Count keys with a capture listener on the raw DOM: vim's own keydown
  // handler consumes normal-mode keys before extension handlers ever run.
  const countKey = (e: KeyboardEvent) => {
    const key = formatKey(e);
    if (key) opts.onKey?.(key);
  };
  view.dom.addEventListener("keydown", countKey, true);

  if (opts.cursor) {
    const line = view.state.doc.line(Math.min(opts.cursor.line, view.state.doc.lines - 1) + 1);
    const pos = Math.min(line.from + opts.cursor.col, line.to);
    view.dispatch({ selection: EditorSelection.cursor(pos) });
  }

  const cm = getCM(view);
  cm?.on("vim-mode-change", (ev: { mode: string }) => {
    mode = ev.mode;
    opts.onModeChange?.(ev.mode);
  });

  return {
    getText: () => view.state.doc.toString(),
    getCursor: () => {
      const head = view.state.selection.main.head;
      const line = view.state.doc.lineAt(head);
      return { line: line.number - 1, col: head - line.from };
    },
    getMode: () => mode,
    focus: () => view.focus(),
    destroy: () => {
      view.dom.removeEventListener("keydown", countKey, true);
      view.destroy();
    },
  };
}
