import {
  getPlans,
  getPlan,
  getPlanDay,
  formatPassage,
  formatPassages,
  passageRoute,
  estimateMinutes,
} from '../planCatalog';

describe('planCatalog', () => {
  it('exposes the three bundled plans', () => {
    const plans = getPlans();
    const ids = plans.map((p) => p.id).sort();
    expect(ids).toEqual(['bible-1-year', 'new-testament-90', 'psalms-proverbs']);
    plans.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.durationDays).toBeGreaterThan(0);
    });
  });

  it('returns a full plan with a schedule matching its duration', () => {
    const plan = getPlan('bible-1-year')!;
    expect(plan).not.toBeNull();
    expect(plan.schedule).toHaveLength(plan.durationDays);
    expect(getPlan('nope')).toBeNull();
  });

  it('resolves a specific day schedule', () => {
    const day1 = getPlanDay('bible-1-year', 1)!;
    expect(day1.day).toBe(1);
    expect(day1.passages.length).toBeGreaterThan(0);
    expect(getPlanDay('bible-1-year', 9999)).toBeNull();
  });

  it('formats single and multi-chapter passages', () => {
    expect(formatPassage({ bookId: 'GEN', startChapter: 1, endChapter: 3 })).toBe('Genesis 1-3');
    expect(formatPassage({ bookId: 'MAT', startChapter: 1 })).toBe('Matthew 1');
    expect(formatPassage({ bookId: 'PSA', startChapter: 5, endChapter: 5 })).toBe('Psalms 5');
  });

  it('joins multiple passages', () => {
    expect(
      formatPassages([
        { bookId: 'GEN', startChapter: 1, endChapter: 3 },
        { bookId: 'MAT', startChapter: 1 },
      ])
    ).toBe('Genesis 1-3 · Matthew 1');
  });

  it('builds a reading route from the first passage', () => {
    expect(passageRoute({ bookId: 'GEN', startChapter: 1, endChapter: 3 })).toBe('/read/genesis-1');
  });

  it('estimates reading time from chapter count', () => {
    expect(estimateMinutes([{ bookId: 'GEN', startChapter: 1, endChapter: 3 }])).toBe(11);
    expect(estimateMinutes([{ bookId: 'MAT', startChapter: 1 }])).toBe(4);
  });
});
