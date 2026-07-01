export type Route = { screen: "home" } | { screen: "lesson"; lessonId: string };

export function parseRoute(hash: string): Route {
  const m = hash.match(/^#\/lesson\/([\w-]+)$/);
  if (m) return { screen: "lesson", lessonId: m[1] };
  return { screen: "home" };
}
