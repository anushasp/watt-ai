import { describe, expect, it } from 'vitest';
import { areaFromPoints, bandScale, linearScale, niceTicks, pathFromPoints } from './scales';

describe('linearScale', () => {
  it('maps the domain onto the range', () => {
    const s = linearScale([0, 10], [0, 100]);
    expect(s(0)).toBe(0);
    expect(s(5)).toBe(50);
    expect(s(10)).toBe(100);
  });

  it('handles an inverted range, as SVG y axes need', () => {
    const s = linearScale([0, 10], [100, 0]);
    expect(s(0)).toBe(100);
    expect(s(10)).toBe(0);
  });

  it('does not divide by zero on a flat domain', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(0);
  });
});

describe('bandScale', () => {
  it('spaces bands evenly inside the range', () => {
    const b = bandScale(4, [0, 100], 0);
    expect(b.step).toBe(25);
    expect(b(0)).toBe(0);
    expect(b(3)).toBe(75);
  });

  it('narrows the bandwidth by the padding', () => {
    expect(bandScale(4, [0, 100], 0.2).bandwidth).toBeCloseTo(20, 5);
  });

  it('survives an empty series', () => {
    expect(bandScale(0, [0, 100]).bandwidth).toBe(0);
  });
});

describe('niceTicks', () => {
  it('returns rounded ticks covering the domain', () => {
    const ticks = niceTicks(0, 58);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(58);
  });

  it('collapses a flat domain to one tick', () => {
    expect(niceTicks(4, 4)).toEqual([4]);
  });
});

describe('paths', () => {
  it('builds a move-then-line path', () => {
    expect(pathFromPoints([{ x: 0, y: 0 }, { x: 10, y: 5 }])).toBe('M0,0 L10,5');
  });

  it('returns an empty string for no points', () => {
    expect(pathFromPoints([])).toBe('');
    expect(areaFromPoints([], 0)).toBe('');
  });

  it('closes an area back to the baseline', () => {
    expect(areaFromPoints([{ x: 0, y: 0 }, { x: 10, y: 5 }], 20)).toBe('M0,0 L10,5 L10,20 L0,20 Z');
  });
});
