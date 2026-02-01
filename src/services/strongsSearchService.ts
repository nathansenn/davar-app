/**
 * Strong's Search Service
 * Searches for Bible verses containing a specific Strong's number
 * 
 * TODO: Implement full-text search using a pre-built Strong's index
 * The BSB text would need to be tagged with Strong's numbers, or we'd need
 * to use a separate tagged dataset like OSHB for OT and tagged GNT for NT.
 */

export interface StrongsSearchResult {
  reference: string;
  text: string;
  highlightedWord?: string;
  bookId: string;
  chapter: number;
  verse: number;
}

export interface StrongsSearchOptions {
  limit?: number;
  offset?: number;
  includeContext?: boolean;
  books?: string[]; // Filter by specific books
}

export interface StrongsSearchResponse {
  results: StrongsSearchResult[];
  total: number;
  strongsNumber: string;
}

// Pre-computed search results for common Strong's numbers
// In production, this would be a database query or pre-built index
const MOCK_SEARCH_INDEX: Record<string, StrongsSearchResult[]> = {
  'G26': [ // ἀγάπη (agape) - love
    { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', highlightedWord: 'loved', bookId: 'JHN', chapter: 3, verse: 16 },
    { reference: '1 John 4:8', text: 'He that loveth not knoweth not God; for God is love.', highlightedWord: 'love', bookId: '1JN', chapter: 4, verse: 8 },
    { reference: '1 John 4:16', text: 'And we have known and believed the love that God hath to us. God is love; and he that dwelleth in love dwelleth in God, and God in him.', highlightedWord: 'love', bookId: '1JN', chapter: 4, verse: 16 },
    { reference: '1 Corinthians 13:4', text: 'Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up', highlightedWord: 'Love', bookId: '1CO', chapter: 13, verse: 4 },
    { reference: '1 Corinthians 13:13', text: 'And now abideth faith, hope, love, these three; but the greatest of these is love.', highlightedWord: 'love', bookId: '1CO', chapter: 13, verse: 13 },
    { reference: 'Romans 5:8', text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.', highlightedWord: 'love', bookId: 'ROM', chapter: 5, verse: 8 },
    { reference: 'Romans 8:35', text: 'Who shall separate us from the love of Christ?', highlightedWord: 'love', bookId: 'ROM', chapter: 8, verse: 35 },
    { reference: 'Romans 8:39', text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.', highlightedWord: 'love', bookId: 'ROM', chapter: 8, verse: 39 },
    { reference: 'Galatians 5:22', text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith', highlightedWord: 'love', bookId: 'GAL', chapter: 5, verse: 22 },
    { reference: 'Ephesians 3:19', text: 'And to know the love of Christ, which passeth knowledge, that ye might be filled with all the fulness of God.', highlightedWord: 'love', bookId: 'EPH', chapter: 3, verse: 19 },
  ],
  'G2316': [ // θεός (theos) - God
    { reference: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', highlightedWord: 'God', bookId: 'JHN', chapter: 1, verse: 1 },
    { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son...', highlightedWord: 'God', bookId: 'JHN', chapter: 3, verse: 16 },
    { reference: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', highlightedWord: 'God', bookId: 'ROM', chapter: 8, verse: 28 },
    { reference: '1 John 4:8', text: 'He that loveth not knoweth not God; for God is love.', highlightedWord: 'God', bookId: '1JN', chapter: 4, verse: 8 },
    { reference: 'Hebrews 11:6', text: 'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.', highlightedWord: 'God', bookId: 'HEB', chapter: 11, verse: 6 },
  ],
  'G2424': [ // Ἰησοῦς (Iēsous) - Jesus
    { reference: 'Matthew 1:21', text: 'And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.', highlightedWord: 'JESUS', bookId: 'MAT', chapter: 1, verse: 21 },
    { reference: 'John 14:6', text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.', highlightedWord: 'Jesus', bookId: 'JHN', chapter: 14, verse: 6 },
    { reference: 'Acts 4:12', text: 'Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.', highlightedWord: 'Jesus', bookId: 'ACT', chapter: 4, verse: 12 },
    { reference: 'Philippians 2:10', text: 'That at the name of Jesus every knee should bow, of things in heaven, and things in earth, and things under the earth', highlightedWord: 'Jesus', bookId: 'PHP', chapter: 2, verse: 10 },
  ],
  'H430': [ // אֱלֹהִים (Elohim) - God
    { reference: 'Genesis 1:1', text: 'In the beginning God created the heaven and the earth.', highlightedWord: 'God', bookId: 'GEN', chapter: 1, verse: 1 },
    { reference: 'Genesis 1:26', text: 'And God said, Let us make man in our image, after our likeness...', highlightedWord: 'God', bookId: 'GEN', chapter: 1, verse: 26 },
    { reference: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God is one LORD', highlightedWord: 'God', bookId: 'DEU', chapter: 6, verse: 4 },
    { reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.', highlightedWord: 'LORD', bookId: 'PSA', chapter: 23, verse: 1 },
  ],
  'H3068': [ // יְהֹוָה (YHWH) - LORD/Yahweh
    { reference: 'Exodus 3:14', text: 'And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you.', highlightedWord: 'I AM', bookId: 'EXO', chapter: 3, verse: 14 },
    { reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.', highlightedWord: 'LORD', bookId: 'PSA', chapter: 23, verse: 1 },
    { reference: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God is one LORD', highlightedWord: 'LORD', bookId: 'DEU', chapter: 6, verse: 4 },
    { reference: 'Isaiah 40:31', text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', highlightedWord: 'LORD', bookId: 'ISA', chapter: 40, verse: 31 },
    { reference: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', highlightedWord: 'LORD', bookId: 'JER', chapter: 29, verse: 11 },
  ],
  'G4102': [ // πίστις (pistis) - faith
    { reference: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.', highlightedWord: 'faith', bookId: 'HEB', chapter: 11, verse: 1 },
    { reference: 'Hebrews 11:6', text: 'But without faith it is impossible to please him...', highlightedWord: 'faith', bookId: 'HEB', chapter: 11, verse: 6 },
    { reference: 'Romans 10:17', text: 'So then faith cometh by hearing, and hearing by the word of God.', highlightedWord: 'faith', bookId: 'ROM', chapter: 10, verse: 17 },
    { reference: 'Ephesians 2:8', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God', highlightedWord: 'faith', bookId: 'EPH', chapter: 2, verse: 8 },
    { reference: 'Galatians 5:22', text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith', highlightedWord: 'faith', bookId: 'GAL', chapter: 5, verse: 22 },
  ],
  'G5485': [ // χάρις (charis) - grace
    { reference: 'Ephesians 2:8', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God', highlightedWord: 'grace', bookId: 'EPH', chapter: 2, verse: 8 },
    { reference: 'Romans 6:14', text: 'For sin shall not have dominion over you: for ye are not under the law, but under grace.', highlightedWord: 'grace', bookId: 'ROM', chapter: 6, verse: 14 },
    { reference: '2 Corinthians 12:9', text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.', highlightedWord: 'grace', bookId: '2CO', chapter: 12, verse: 9 },
    { reference: 'John 1:14', text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.', highlightedWord: 'grace', bookId: 'JHN', chapter: 1, verse: 14 },
  ],
  'G1680': [ // ἐλπίς (elpis) - hope
    { reference: 'Romans 5:5', text: 'And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.', highlightedWord: 'hope', bookId: 'ROM', chapter: 5, verse: 5 },
    { reference: 'Romans 15:13', text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.', highlightedWord: 'hope', bookId: 'ROM', chapter: 15, verse: 13 },
    { reference: '1 Corinthians 13:13', text: 'And now abideth faith, hope, love, these three; but the greatest of these is love.', highlightedWord: 'hope', bookId: '1CO', chapter: 13, verse: 13 },
    { reference: 'Hebrews 6:19', text: 'Which hope we have as an anchor of the soul, both sure and stedfast, and which entereth into that within the veil', highlightedWord: 'hope', bookId: 'HEB', chapter: 6, verse: 19 },
  ],
};

class StrongsSearchService {
  /**
   * Search for verses containing a specific Strong's number
   */
  async searchByStrongs(
    strongsNumber: string,
    options: StrongsSearchOptions = {}
  ): Promise<StrongsSearchResponse> {
    const { limit = 50, offset = 0, books } = options;
    
    // Normalize the Strong's number (uppercase, with prefix)
    const normalizedNumber = strongsNumber.toUpperCase();
    
    // Get mock results or empty array
    let results = MOCK_SEARCH_INDEX[normalizedNumber] || [];
    
    // Filter by books if specified
    if (books && books.length > 0) {
      results = results.filter(r => books.includes(r.bookId));
    }
    
    const total = results.length;
    
    // Apply pagination
    results = results.slice(offset, offset + limit);
    
    return {
      results,
      total,
      strongsNumber: normalizedNumber,
    };
  }
  
  /**
   * Get verse count for a Strong's number without full results
   * Useful for frequency data
   */
  async getOccurrenceCount(strongsNumber: string): Promise<number> {
    const normalizedNumber = strongsNumber.toUpperCase();
    return MOCK_SEARCH_INDEX[normalizedNumber]?.length || 0;
  }
  
  /**
   * Get book distribution for a Strong's number
   */
  async getBookDistribution(strongsNumber: string): Promise<{ bookId: string; count: number }[]> {
    const normalizedNumber = strongsNumber.toUpperCase();
    const results = MOCK_SEARCH_INDEX[normalizedNumber] || [];
    
    // Count occurrences per book
    const bookCounts: Record<string, number> = {};
    for (const result of results) {
      bookCounts[result.bookId] = (bookCounts[result.bookId] || 0) + 1;
    }
    
    // Convert to array and sort by count
    return Object.entries(bookCounts)
      .map(([bookId, count]) => ({ bookId, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const strongsSearchService = new StrongsSearchService();
export default strongsSearchService;
