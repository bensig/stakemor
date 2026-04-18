export interface Step {
  number: number;
  title: string;
  blurb: string;          // 1–2 sentence "what & why"
  ctaLabel: string;       // button text, e.g. "Open Sushi"
  ctaHref: string;        // outbound URL
  successCriterion: string; // "what success looks like"
  gotcha?: string;        // optional foot-gun callout
  screenshot?: string;    // /screenshots/foo.png — optional, populated later
}

export interface Path {
  id: 'long' | 'short';
  label: string;
  amountHint: string;
  steps: Step[];
}
