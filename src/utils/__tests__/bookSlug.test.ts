import {
  BOOK_ID_TO_SLUG,
  bookIdToSlug,
  slugToBookId,
  getTestament,
} from '../bookSlug';

describe('bookSlug', () => {
  it('covers all 66 books', () => {
    expect(Object.keys(BOOK_ID_TO_SLUG)).toHaveLength(66);
  });

  it('round-trips id -> slug -> id', () => {
    for (const id of Object.keys(BOOK_ID_TO_SLUG)) {
      expect(slugToBookId(bookIdToSlug(id))).toBe(id);
    }
  });

  it('maps known books', () => {
    expect(bookIdToSlug('GEN')).toBe('genesis');
    expect(bookIdToSlug('PSA')).toBe('psalm');
    expect(bookIdToSlug('1CO')).toBe('1-corinthians');
    expect(slugToBookId('john')).toBe('JHN');
    expect(slugToBookId('psalms')).toBe('PSA');
  });

  it('classifies testament correctly', () => {
    expect(getTestament('GEN')).toBe('OT');
    expect(getTestament('MAL')).toBe('OT');
    expect(getTestament('MAT')).toBe('NT');
    expect(getTestament('REV')).toBe('NT');
  });

  it('returns undefined for unknown slug', () => {
    expect(slugToBookId('nonsense')).toBeUndefined();
  });
});
