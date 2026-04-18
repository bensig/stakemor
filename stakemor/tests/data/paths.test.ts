import { describe, it, expect } from 'vitest';
import { longPath } from '../../src/data/long-path';
import { shortPath } from '../../src/data/short-path';

describe('path data', () => {
  it('long path has 5 sequentially-numbered steps', () => {
    expect(longPath.steps).toHaveLength(5);
    longPath.steps.forEach((s, i) => expect(s.number).toBe(i + 1));
  });

  it('short path has 4 sequentially-numbered steps', () => {
    expect(shortPath.steps).toHaveLength(4);
    shortPath.steps.forEach((s, i) => expect(s.number).toBe(i + 1));
  });

  it.each([longPath, shortPath])(
    '$id path has every required field on every step',
    (path) => {
      for (const step of path.steps) {
        expect(step.title).toBeTruthy();
        expect(step.blurb.length).toBeGreaterThan(20);
        expect(step.ctaLabel).toBeTruthy();
        expect(step.ctaHref).toMatch(/^https:\/\//);
        expect(step.successCriterion).toBeTruthy();
      }
    },
  );

  it('every Sushi link includes the referrer param', () => {
    const allSteps = [...longPath.steps, ...shortPath.steps];
    const sushiSteps = allSteps.filter((s) =>
      s.ctaHref.includes('sushi.com'),
    );
    expect(sushiSteps.length).toBeGreaterThan(0);
    sushiSteps.forEach((s) => expect(s.ctaHref).toContain('referrer='));
  });
});
