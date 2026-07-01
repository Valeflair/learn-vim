import type { Lesson } from "../lessons/types";

export function renderLesson(app: HTMLElement, lesson: Lesson): void {
  app.innerHTML = "";
  const h = document.createElement("h1");
  h.textContent = lesson.title;
  app.appendChild(h);
}
