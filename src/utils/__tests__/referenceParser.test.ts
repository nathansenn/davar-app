import { parseReference, referenceToPath, formatReference } from '../referenceParser';

describe('parseReference', () => {
  it('parses a whole-chapter reference', () => {
    expect(parseReference('John 3')).toMatchObject({ bookSlug: 'john', chapter: 3 });
  });

  it('parses a single-verse reference', () => {
    expect(parseReference('John 3:16')).toMatchObject({
      bookSlug: 'john',
      chapter: 3,
      verseStart: 16,
    });
  });

  it('parses a verse range', () => {
    expect(parseReference('John 3:16-18')).toMatchObject({
      bookSlug: 'john',
      chapter: 3,
      verseStart: 16,
      verseEnd: 18,
    });
  });

  it('parses numbered books', () => {
    expect(parseReference('1 Corinthians 13:4')).toMatchObject({
      bookSlug: '1-corinthians',
      chapter: 13,
      verseStart: 4,
    });
  });

  it('parses abbreviations', () => {
    expect(parseReference('Ps 23')).toMatchObject({ bookSlug: 'psalm', chapter: 23 });
    expect(parseReference('Gen 1:1')).toMatchObject({ bookSlug: 'genesis', chapter: 1, verseStart: 1 });
  });

  it('returns null for garbage', () => {
    expect(parseReference('not a reference')).toBeNull();
    expect(parseReference('')).toBeNull();
  });
});

describe('referenceToPath', () => {
  it('builds a chapter path', () => {
    expect(referenceToPath({ bookName: 'John', bookSlug: 'john', chapter: 3 })).toBe('/read/john-3');
  });

  it('includes a verse query when present', () => {
    expect(
      referenceToPath({ bookName: 'John', bookSlug: 'john', chapter: 3, verseStart: 16 })
    ).toBe('/read/john-3?verse=16');
  });
});

describe('formatReference', () => {
  it('formats chapter and verse', () => {
    expect(formatReference({ bookName: 'John', bookSlug: 'john', chapter: 3, verseStart: 16 })).toBe(
      'John 3:16'
    );
  });
});
