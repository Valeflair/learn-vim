# learn-vim

A local, free, vim-hero-style interactive Vim tutor. 18 lessons from modes
and `hjkl` to registers, marks, and macros. Each lesson is a **drill**:
~10 randomized micro-tasks solved in an embedded Vim-emulating editor
(CodeMirror + codemirror-vim), measured by elapsed time and total
keystrokes — beat your best.

## Run

    npm install
    npm run dev

Open the printed URL. Progress (best time and keystrokes per lesson) is
saved in your browser's localStorage.

## Develop

    npm test          # vitest
    npm run build     # typecheck + production build

Lessons live in `src/lessons/` — one data file per lesson holding intro
paragraphs, a key reference, and a pool of task **generators** drawn from
`src/lessons/gen.ts` (seeded RNG, so drills are reproducible). Add a lesson
by creating a file and registering it in `src/lessons/index.ts`;
`tests/lessons.test.ts` validates the format and fuzzes every generator
across many seeds. The drill state machine is `src/challenge/drill.ts`.

Note: insert-mode typing, the `/` search panel, and `j`/`k` display motions
can't be driven by synthetic keys in jsdom — those paths need a real
browser playtest.
