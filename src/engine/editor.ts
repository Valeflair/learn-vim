import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine } from "@codemirror/view";
import { EditorState, EditorSelection } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { vim, getCM } from "@replit/codemirror-vim";
import { formatKey } from "./keys";
import type { Cursor } from "../lessons/types";

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
  onKey?: (key: string) => void;
  onChange?: () => void;
  onModeChange?: (mode: string) => void;
};

export function createEditor(opts: EditorOptions): EditorHandle {
  let mode = "normal";

  const state = EditorState.create({
    doc: opts.doc,
    extensions: [
      vim(), // must precede other keymaps
      lineNumbers(),
      history(),
      drawSelection(),
      highlightActiveLine(),
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
