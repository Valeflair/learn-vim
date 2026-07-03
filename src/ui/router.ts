export type Route =
  | { screen: "home" }
  | { screen: "lesson"; lessonId: string }
  | { screen: "revision"; chapterSlug: string };

export function parseRoute(hash: string): Route {
  const lesson = hash.match(/^#\/lesson\/([\w-]+)$/);
  if (lesson) return { screen: "lesson", lessonId: lesson[1] };
  const revision = hash.match(/^#\/revision\/([\w-]+)$/);
  if (revision) return { screen: "revision", chapterSlug: revision[1] };
  return { screen: "home" };
}
