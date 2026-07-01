import "./style.css";
import { parseRoute } from "./ui/router";
import { renderHome } from "./ui/home";
import { renderLesson } from "./ui/lesson";
import { getLesson } from "./lessons/index";

const app = document.querySelector<HTMLDivElement>("#app")!;

function render(): void {
  const route = parseRoute(location.hash);
  if (route.screen === "lesson") {
    const lesson = getLesson(route.lessonId);
    if (!lesson) {
      location.hash = "#/";
      return;
    }
    renderLesson(app, lesson);
  } else {
    renderHome(app);
  }
}

window.addEventListener("hashchange", render);
render();
