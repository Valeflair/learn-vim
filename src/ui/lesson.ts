import type { Lesson, Step, Challenge } from "../lessons/types";
import { createEditor, type EditorHandle } from "../engine/editor";
import { Referee } from "../challenge/referee";
import { recordResult } from "../progress/store";

function inlineCode(text: string): string {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function renderLesson(app: HTMLElement, lesson: Lesson): void {
  let stepIndex = 0;
  let editor: EditorHandle | null = null;

  function teardown(): void {
    editor?.destroy();
    editor = null;
  }

  function next(): void {
    teardown();
    stepIndex++;
    render();
  }

  function render(): void {
    app.innerHTML = "";

    const top = document.createElement("div");
    top.className = "lesson-top";
    top.innerHTML = `<h1>${lesson.title}</h1><a href="#/">← lessons</a>`;
    app.appendChild(top);

    const progress = document.createElement("div");
    progress.className = "progress-line";
    progress.textContent = `Step ${Math.min(stepIndex + 1, lesson.steps.length)} of ${lesson.steps.length}`;
    app.appendChild(progress);

    if (stepIndex >= lesson.steps.length) {
      renderComplete();
      return;
    }
    const step = lesson.steps[stepIndex];
    if (step.kind === "explanation") renderExplanation(step);
    else renderChallenge(step);
  }

  function renderComplete(): void {
    const div = document.createElement("div");
    div.className = "instruction";
    div.innerHTML = `<p>Lesson complete 🎉</p><p><a href="#/">Back to all lessons</a></p>`;
    app.appendChild(div);
  }

  function renderExplanation(step: Extract<Step, { kind: "explanation" }>): void {
    const div = document.createElement("div");
    div.className = "instruction explanation";
    div.innerHTML = inlineCode(step.text);
    app.appendChild(div);

    if (step.example) {
      const pre = document.createElement("pre");
      pre.className = "editor-wrap";
      pre.textContent = step.example.text;
      app.appendChild(pre);
    }

    const controls = document.createElement("div");
    controls.className = "controls";
    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Continue";
    btn.addEventListener("click", next);
    controls.appendChild(btn);
    app.appendChild(controls);
  }

  function renderChallenge(challenge: Challenge): void {
    const referee = new Referee(challenge);

    const instr = document.createElement("div");
    instr.className = "instruction";
    instr.innerHTML = inlineCode(challenge.instruction);
    app.appendChild(instr);

    const wrap = document.createElement("div");
    wrap.className = "editor-wrap";
    app.appendChild(wrap);

    const bar = document.createElement("div");
    bar.className = "status-bar";
    const modeEl = document.createElement("span");
    modeEl.className = "mode mode-normal";
    modeEl.textContent = "normal";
    const keysEl = document.createElement("span");
    keysEl.className = "keys";
    const parEl = document.createElement("span");
    parEl.className = "par";
    const solvedEl = document.createElement("span");
    bar.append(modeEl, keysEl, parEl, solvedEl);
    app.appendChild(bar);

    const controls = document.createElement("div");
    controls.className = "controls";
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    const nextBtn = document.createElement("button");
    nextBtn.className = "primary";
    nextBtn.textContent = "Next";
    nextBtn.disabled = true;
    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Skip";
    controls.append(resetBtn);
    if (challenge.hint) {
      const hintBtn = document.createElement("button");
      hintBtn.textContent = "Hint";
      hintBtn.addEventListener("click", () => {
        hint.textContent = challenge.hint!;
      });
      controls.append(hintBtn);
    }
    controls.append(skipBtn, nextBtn);
    app.appendChild(controls);

    const hint = document.createElement("div");
    hint.className = "hint-text";
    app.appendChild(hint);

    function updateBar(): void {
      keysEl.textContent = referee.keystrokes.join(" ");
      parEl.textContent = `${referee.count} / par ${challenge.par}`;
      parEl.className = referee.underPar ? "par" : "par par-over";
      if (referee.solved) {
        solvedEl.className = "solved";
        solvedEl.textContent = `✓ Solved in ${referee.count} (par ${challenge.par})`;
        nextBtn.disabled = false;
      } else {
        solvedEl.className = "";
        solvedEl.textContent = "";
      }
    }

    function checkNow(): void {
      if (!editor) return;
      const wasSolved = referee.solved;
      if (referee.check(editor.getText(), editor.getCursor(), editor.getMode()) && !wasSolved) {
        recordResult(challenge.id, referee.count);
      }
      updateBar();
    }

    function mount(): void {
      teardown();
      wrap.innerHTML = "";
      referee.reset();
      editor = createEditor({
        parent: wrap,
        doc: challenge.startText,
        cursor: challenge.startCursor,
        onKey: (k) => {
          referee.onKey(k);
          updateBar();
        },
        onChange: checkNow,
        onModeChange: (m) => {
          modeEl.textContent = m;
          modeEl.className = `mode mode-${m}`;
          checkNow();
        },
      });
      updateBar();
      editor.focus();
    }

    resetBtn.addEventListener("click", mount);
    skipBtn.addEventListener("click", next);
    nextBtn.addEventListener("click", next);
    mount();
  }

  render();
}
