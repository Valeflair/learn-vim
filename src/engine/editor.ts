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
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { vim, getCM } from "@replit/codemirror-vim";
import { formatKey } from "./keys";
import type { Cursor, TaskGhost, TaskMark } from "../lessons/types";

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
  /** Red = text to delete or change; blue = the line/span to act on. */
  marks?: TaskMark[];
  /** Missing text rendered as a green dashed box at its insertion point. */
  ghost?: TaskGhost;
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
    el.textContent = this.text;
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
      const { from } = posAt(state.doc, m.line, m.from);
      const { from: to } = posAt(state.doc, m.line, m.to);
      const deco = m.kind === "focus" ? focusMark : editMark;
      if (from < to) ranges.push(deco.range(from, to));
    }
  }
  if (opts.ghost) {
    const { from } = posAt(state.doc, opts.ghost.line, opts.ghost.col);
    ranges.push(Decoration.widget({ widget: new GhostWidget(opts.ghost.text), side: 1 }).range(from));
  }
  if (opts.target) {
    const { from, to } = posAt(state.doc, opts.target.line, opts.target.col);
    if (from < to) ranges.push(targetMark.range(from, from + 1));
    else ranges.push(targetLine.range(state.doc.lineAt(from).from));
  }
  return Decoration.set(ranges, true);
}

export function createEditor(opts: EditorOptions): EditorHandle {
  let mode = "normal";

  // Highlights survive edits by mapping through changes; a deleted red mark
  // collapses to nothing, which is exactly when it should disappear.
  const taskField = StateField.define<DecorationSet>({
    create: (state) => taskDecorations(state, opts),
    update: (deco, tr) => (tr.docChanged ? deco.map(tr.changes) : deco),
    provide: (f) => EditorView.decorations.from(f),
  });

  const state = EditorState.create({
    doc: opts.doc,
    extensions: [
      vim(), // must precede other keymaps
      hybridLineNumbers,
      history(),
      drawSelection(),
      highlightActiveLine(),
      taskField,
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
