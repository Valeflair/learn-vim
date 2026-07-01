export type Cursor = { line: number; col: number };

export type Explanation = {
  kind: "explanation";
  text: string;
  example?: { text: string };
};

export type Challenge = {
  kind: "challenge";
  id: string;
  instruction: string;
  startText: string;
  startCursor: Cursor;
  targetText: string;
  targetCursor?: Cursor;
  requireNormal?: boolean;
  par: number;
  hint?: string;
};

export type Step = Explanation | Challenge;

export type Lesson = {
  id: string;
  title: string;
  section: string;
  order: number;
  steps: Step[];
};
