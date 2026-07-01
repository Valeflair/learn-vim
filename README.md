# learn-vim

A local, free, vim-hero-style interactive Vim tutor. 18 lessons from modes
and `hjkl` to registers, marks, and macros — solved in an embedded
Vim-emulating editor (CodeMirror + codemirror-vim), judged by state match
and keystroke par.

## Run

    npm install
    npm run dev

Open the printed URL. Progress is saved in your browser's localStorage.

## Develop

    npm test          # vitest
    npm run build     # typecheck + production build

Lessons live in `src/lessons/` — one data file per lesson. Add a lesson by
creating a file and registering it in `src/lessons/index.ts`; the data
validation test in `tests/lessons.test.ts` guards the format, and
`tests/solvability.test.ts` replays optimal solutions through the real
editor for challenges that jsdom can drive (normal-mode commands; insert
typing, the search panel, and `j`/`k` display motions need a real browser).
