import type { Lesson } from "../lessons/types";
import { adjacentLessons, revisionGenerators } from "../lessons/index";
import { createEditor, type EditorHandle } from "../engine/editor";
import { Drill, randomSeed, charsWrong } from "../challenge/drill";
import { recordResult, lessonRecord, formatTime } from "../progress/store";
import { md } from "./md";

/**
 * Drill view: the lesson's explanation and key reference stay visible on the
 * left while ~10 randomized tasks run in the editor on the right, measured
 * by elapsed time and total keystrokes.
 */
export function renderLesson(app: HTMLElement, lesson: Lesson): () => void {
  let editor: EditorHandle | null = null;
  let drill = new Drill(lesson, randomSeed());
  let advancing = false;
  // Revision runs mix in tasks from earlier lessons; off by default.
  let revised = false;

  const { prev, next } = adjacentLessons(lesson.id);

  app.innerHTML = "";
  const root = document.createElement("div");
  root.className = "lesson";
  root.innerHTML = `
    <header class="lesson-header">
      <p class="crumb">${lesson.section} · Lesson ${lesson.order}</p>
      <h1>${lesson.title}</h1>
    </header>
    <div class="lesson-columns">
      <aside class="lesson-doc">
        <div class="intro"></div>
        <h2>Keys in this lesson</h2>
        <ul class="key-ref"></ul>
      </aside>
      <section class="lesson-drill">
        <div class="drill-head">
          <span class="drill-count"></span>
          <span class="drill-dots"></span>
        </div>
        <div class="drill-body"></div>
        <details class="runs">
          <summary>previous runs</summary>
          <ol class="runs-list"></ol>
        </details>
      </section>
    </div>
    <nav class="lesson-nav"></nav>
  `;
  app.appendChild(root);

  const intro = root.querySelector<HTMLElement>(".intro")!;
  for (const para of lesson.intro) {
    const p = document.createElement("p");
    p.innerHTML = md(para);
    intro.appendChild(p);
  }

  const keyRef = root.querySelector<HTMLElement>(".key-ref")!;
  for (const k of lesson.keys) {
    const li = document.createElement("li");
    li.innerHTML = `<kbd>${md(k.keys).replace(/<\/?kbd>/g, "")}</kbd><span>${md(k.label)}</span>`;
    keyRef.appendChild(li);
  }

  const nav = root.querySelector<HTMLElement>(".lesson-nav")!;
  nav.innerHTML = `
    ${
      prev
        ? `<a class="nav-prev" href="#/lesson/${prev.id}">
             <span class="nav-hint">‹ Back <kbd>Ctrl+K</kbd></span>
             <span class="nav-title">${prev.title}</span>
           </a>`
        : "<span></span>"
    }
    ${
      next
        ? `<a class="nav-next" href="#/lesson/${next.id}">
             <span class="nav-hint">Next <kbd>Ctrl+J</kbd> ›</span>
             <span class="nav-title">${next.title}</span>
           </a>`
        : "<span></span>"
    }
  `;

  // vim-hero's lesson hotkeys: Ctrl+j = next lesson, Ctrl+k = previous.
  // Captured on window so the editor's vim handler never sees them.
  function onHotkey(e: KeyboardEvent): void {
    if (!e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    const to = e.key === "j" ? next : e.key === "k" ? prev : undefined;
    if (!to) return;
    e.preventDefault();
    e.stopPropagation();
    location.hash = `#/lesson/${to.id}`;
  }
  window.addEventListener("keydown", onHotkey, true);

  const countEl = root.querySelector<HTMLElement>(".drill-count")!;
  const dotsEl = root.querySelector<HTMLElement>(".drill-dots")!;
  const body = root.querySelector<HTMLElement>(".drill-body")!;

  let timerEl: HTMLElement | null = null;
  const timerId = window.setInterval(() => {
    if (timerEl && drill.state === "running") {
      timerEl.textContent = formatTime(drill.elapsedMs());
    }
  }, 250);

  const runsList = root.querySelector<HTMLElement>(".runs-list")!;
  function renderRuns(): void {
    const runs = lessonRecord(lesson.id)?.runs ?? [];
    runsList.innerHTML = runs.length
      ? [...runs]
          .reverse()
          .map(
            (r) => `<li>
              <span class="run-date">${new Date(r.at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
              <span class="run-time">${formatTime(r.timeMs)}</span>
              <span class="run-keys">${r.keystrokes} keys</span>
              ${r.revised ? '<span class="run-rev">revision</span>' : ""}
            </li>`,
          )
          .join("")
      : '<li class="run-empty">no runs yet</li>';
  }
  renderRuns();

  function updateHead(): void {
    const rev = revised ? " · revision" : "";
    if (drill.state === "finished") {
      countEl.textContent = `Drill complete${rev}`;
    } else {
      countEl.textContent = `Task ${drill.taskIndex + 1} of ${drill.total}${rev}`;
    }
    dotsEl.innerHTML = "";
    for (let i = 0; i < drill.total; i++) {
      const dot = document.createElement("span");
      dot.className =
        i < drill.taskIndex || drill.state === "finished"
          ? "dot done"
          : i === drill.taskIndex
            ? "dot current"
            : "dot";
      dotsEl.appendChild(dot);
    }
  }

  function teardown(): void {
    editor?.destroy();
    editor = null;
  }

  function restart(withRevisions: boolean): void {
    revised = withRevisions;
    drill = new Drill(lesson, randomSeed(), withRevisions ? revisionGenerators(lesson) : undefined);
    advancing = false;
    mountTask();
  }

  function mountTask(): void {
    teardown();
    updateHead();
    const task = drill.current;

    body.innerHTML = `
      <div class="task-instruction">
        <span class="task-text">${md(task.instruction)}</span>
        ${task.keyHint ? `<button class="ghost hint-btn" title="Show which keys to use">hint?</button><span class="key-chip hidden">${task.keyHint}</span>` : ""}
      </div>
      <div class="editor-wrap"></div>
      <div class="status-bar">
        <span class="mode mode-normal">NORMAL</span>
        <span class="stat timer">00:00</span>
        <span class="stat kcount">0 keys</span>
        <span class="stat undo-hint hidden"><kbd>Esc</kbd> <kbd>u</kbd> to undo</span>
        <span class="spacer"></span>
        <button class="ghost reset-task" title="Reset this task">reset task</button>
        <button class="ghost restart" title="Restart the drill with new tasks">↻ restart</button>
      </div>
    `;
    const wrap = body.querySelector<HTMLElement>(".editor-wrap")!;
    const modeEl = body.querySelector<HTMLElement>(".mode")!;
    const kcountEl = body.querySelector<HTMLElement>(".kcount")!;
    timerEl = body.querySelector<HTMLElement>(".timer")!;
    timerEl.textContent = formatTime(drill.elapsedMs());
    kcountEl.textContent = `${drill.keystrokes} keys`;
    const undoHintEl = body.querySelector<HTMLElement>(".undo-hint")!;
    const baseline = charsWrong(task.startText, task.targetText);

    function checkNow(): void {
      if (advancing || !editor) return;
      undoHintEl.classList.toggle("hidden", charsWrong(editor.getText(), task.targetText) <= baseline);
      if (drill.check(editor.getText(), editor.getCursor(), editor.getMode())) {
        advancing = true;
        wrap.classList.add("solved");
        window.setTimeout(() => {
          drill.advance();
          advancing = false;
          if (drill.state === "finished") finish();
          else mountTask();
        }, 300);
      }
    }

    editor = createEditor({
      parent: wrap,
      doc: task.startText,
      cursor: task.startCursor,
      target: task.targetCursor,
      marks: task.marks,
      targetText: task.targetText,
      onKey: () => {
        drill.recordKey();
        kcountEl.textContent = `${drill.keystrokes} keys`;
      },
      onChange: checkNow,
      onModeChange: (m) => {
        modeEl.textContent = m.toUpperCase();
        modeEl.className = `mode mode-${m}`;
        checkNow();
      },
    });

    body.querySelector(".reset-task")!.addEventListener("click", mountTask);
    body.querySelector(".restart")!.addEventListener("click", () => restart(revised));
    const hintBtn = body.querySelector<HTMLButtonElement>(".hint-btn");
    hintBtn?.addEventListener("click", () => {
      body.querySelector(".key-chip")!.classList.remove("hidden");
      hintBtn.classList.add("hidden");
    });
    editor.focus();
  }

  function finish(): void {
    teardown();
    updateHead();
    timerEl = null;

    const res = drill.result()!;
    const before = lessonRecord(lesson.id);
    recordResult(lesson.id, res.timeMs, res.keystrokes, revised);
    const newBestTime = !revised && (!before || res.timeMs < before.bestTimeMs);
    const newBestKeys = !revised && (!before || res.keystrokes < before.bestKeystrokes);
    renderRuns();

    body.innerHTML = `
      <div class="results">
        <p class="results-title">✓ Drill complete</p>
        <div class="results-stats">
          <div class="results-stat">
            <span class="value">${formatTime(res.timeMs)}</span>
            <span class="label">time${newBestTime ? " · new best" : ""}</span>
          </div>
          <div class="results-stat">
            <span class="value">${res.keystrokes}</span>
            <span class="label">keystrokes${newBestKeys ? " · new best" : ""}</span>
          </div>
        </div>
        ${
          before
            ? `<p class="results-best">previous best: ${formatTime(before.bestTimeMs)} · ${before.bestKeystrokes} keys</p>`
            : ""
        }
        <div class="results-actions">
          <button class="primary again">↻ Run again</button>
          <button class="again-rev" title="Mix in tasks from all earlier lessons">↻ Run again with revisions</button>
        </div>
      </div>
    `;
    body.querySelector(".again")!.addEventListener("click", () => restart(false));
    body.querySelector(".again-rev")!.addEventListener("click", () => restart(true));
  }

  mountTask();

  return () => {
    window.clearInterval(timerId);
    window.removeEventListener("keydown", onHotkey, true);
    teardown();
  };
}
