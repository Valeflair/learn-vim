import { lessons } from "../lessons/index";
import { lessonProgress } from "../progress/store";

const BADGE = { none: "", partial: "◐", done: "✓" } as const;

export function renderHome(app: HTMLElement): void {
  const sections = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    if (!sections.has(lesson.section)) sections.set(lesson.section, []);
    sections.get(lesson.section)!.push(lesson);
  }

  app.innerHTML = "";
  const h1 = document.createElement("h1");
  h1.textContent = "learn-vim";
  app.appendChild(h1);

  for (const [name, sectionLessons] of sections) {
    const h2 = document.createElement("h2");
    h2.textContent = name;
    app.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "grid";
    for (const lesson of sectionLessons) {
      const state = lessonProgress(lesson);
      const card = document.createElement("a");
      card.className = `card card-${state}`;
      card.href = `#/lesson/${lesson.id}`;
      card.innerHTML = `<span class="card-order">${lesson.order}</span> ${lesson.title} <span class="card-badge">${BADGE[state]}</span>`;
      grid.appendChild(card);
    }
    app.appendChild(grid);
  }
}
