import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  Decoration,
} from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorState, EditorSelection, StateField } from "@codemirror/state";
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
  /** Red highlights over text to delete or change (edit tasks). */
  marks?: TaskMark[];
  onKey?: (key: string) => void;
  onChange?: () => void;
  onModeChange?: (mode: string) => void;
};

const targetMark = Decoration.mark({ class: "lv-target" });
const targetLine = Decoration.line({ class: "lv-target-line" });
const editMark = Decoration.mark({ class: "lv-mark" });

function posAt(doc: EditorState["doc"], line: number, col: number): { from: number; to: number } {
  const l = doc.line(Math.min(line, doc.lines - 1) + 1);
  return { from: Math.min(l.from + col, l.to), to: l.to };
}

function taskDecorations(state: EditorState, target?: Cursor, marks?: TaskMark[]): DecorationSet {
  const ranges = [];
  if (marks) {
    for (const m of marks) {
      const { from } = posAt(state.doc, m.line, m.from);
      const { from: to } = posAt(state.doc, m.line, m.to);
      if (from < to) ranges.push(editMark.range(from, to));
    }
  }
  if (target) {
    const { from, to } = posAt(state.doc, target.line, target.col);
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
    create: (state) => taskDecorations(state, opts.target, opts.marks),
    update: (deco, tr) => (tr.docChanged ? deco.map(tr.changes) : deco),
    provide: (f) => EditorView.decorations.from(f),
  });

  const state = EditorState.create({
    doc: opts.doc,
    extensions: [
      vim(), // must precede other keymaps
      lineNumbers(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      taskField,
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.domEventHandlers({
        keydown: (e) => {
          const key = formatKey(e);
          if (key) opts.onKey?.(key);
          return false; // never consume; vim handles the key
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) opts.onChange?.();
      }),
    ],
  });

  const view = new EditorView({ state, parent: opts.parent });

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
    destroy: () => view.destroy(),
  };
}
