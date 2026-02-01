/**
 * Strong's Concordance Service
 * Provides access to Strong's Hebrew and Greek dictionary entries
 */

export interface StrongsEntry {
  lemma: string;           // Original Hebrew/Greek word
  transliteration: string; // Romanized spelling
  pronunciation: string;   // Pronunciation guide
  definition: string;      // Primary definition
  derivation: string;      // Etymology/word origin
  kjvUsage: string;        // How the word is used in KJV
}

// Lazy-loaded data caches
let hebrewData: Record<string, StrongsEntry> | null = null;
let greekData: Record<string, StrongsEntry> | null = null;

/**
 * Load Hebrew Strong's data (lazy loaded on first access)
 */
async function loadHebrewData(): Promise<Record<string, StrongsEntry>> {
  if (hebrewData) return hebrewData;
  
  try {
    // In React Native, use require for bundled assets
    const data = require('../../assets/strongs/hebrew.json');
    hebrewData = data;
    return hebrewData as Record<string, StrongsEntry>;
  } catch (error) {
    console.error('Failed to load Hebrew Strong\'s data:', error);
    return {};
  }
}

/**
 * Load Greek Strong's data (lazy loaded on first access)
 */
async function loadGreekData(): Promise<Record<string, StrongsEntry>> {
  if (greekData) return greekData;
  
  try {
    // In React Native, use require for bundled assets
    const data = require('../../assets/strongs/greek.json');
    greekData = data;
    return greekData as Record<string, StrongsEntry>;
  } catch (error) {
    console.error('Failed to load Greek Strong\'s data:', error);
    return {};
  }
}

/**
 * Strong's Concordance Service
 */
export const strongsService = {
  /**
   * Get a Hebrew word entry by Strong's number
   * @param strongsNumber - e.g., "H1" or "1" or 1
   * @returns The Strong's entry or null if not found
   */
  async getHebrewWord(strongsNumber: string | number): Promise<StrongsEntry | null> {
    const data = await loadHebrewData();
    const key = normalizeStrongsNumber(strongsNumber, 'H');
    return data[key] || null;
  },

  /**
   * Get a Greek word entry by Strong's number
   * @param strongsNumber - e.g., "G1" or "1" or 1
   * @returns The Strong's entry or null if not found
   */
  async getGreekWord(strongsNumber: string | number): Promise<StrongsEntry | null> {
    const data = await loadGreekData();
    const key = normalizeStrongsNumber(strongsNumber, 'G');
    return data[key] || null;
  },

  /**
   * Get a word entry by Strong's number (auto-detects Hebrew/Greek)
   * @param strongsNumber - e.g., "H1", "G25", etc.
   * @returns The Strong's entry or null if not found
   */
  async getWord(strongsNumber: string): Promise<StrongsEntry | null> {
    const upper = strongsNumber.toUpperCase();
    if (upper.startsWith('H')) {
      return this.getHebrewWord(strongsNumber);
    } else if (upper.startsWith('G')) {
      return this.getGreekWord(strongsNumber);
    }
    return null;
  },

  /**
   * Search for words matching a query
   * Searches lemma, transliteration, and definition fields
   * @param query - Search string
   * @param options - Search options
   * @returns Array of matching entries with their Strong's numbers
   */
  async search(
    query: string,
    options: {
      language?: 'hebrew' | 'greek' | 'both';
      maxResults?: number;
      fields?: ('lemma' | 'transliteration' | 'definition' | 'kjvUsage')[];
    } = {}
  ): Promise<Array<{ number: string; entry: StrongsEntry }>> {
    const {
      language = 'both',
      maxResults = 50,
      fields = ['lemma', 'transliteration', 'definition', 'kjvUsage']
    } = options;

    const results: Array<{ number: string; entry: StrongsEntry }> = [];
    const lowerQuery = query.toLowerCase();

    const searchData = async (
      data: Record<string, StrongsEntry>,
      prefix: string
    ) => {
      for (const [key, entry] of Object.entries(data)) {
        if (results.length >= maxResults) break;

        const matches = fields.some(field => {
          const value = entry[field];
          return value && value.toLowerCase().includes(lowerQuery);
        });

        if (matches) {
          results.push({ number: key, entry });
        }
      }
    };

    if (language === 'hebrew' || language === 'both') {
      const hebrewData = await loadHebrewData();
      await searchData(hebrewData, 'H');
    }

    if ((language === 'greek' || language === 'both') && results.length < maxResults) {
      const greekData = await loadGreekData();
      await searchData(greekData, 'G');
    }

    return results;
  },

  /**
   * Preload all Strong's data into memory
   * Call this early in app lifecycle for faster lookups later
   */
  async preload(): Promise<void> {
    await Promise.all([loadHebrewData(), loadGreekData()]);
  },

  /**
   * Clear cached data to free memory
   */
  clearCache(): void {
    hebrewData = null;
    greekData = null;
  },

  /**
   * Get statistics about the loaded data
   */
  async getStats(): Promise<{
    hebrewCount: number;
    greekCount: number;
    hebrewRange: { min: number; max: number };
    greekRange: { min: number; max: number };
  }> {
    const hebrew = await loadHebrewData();
    const greek = await loadGreekData();

    const hebrewKeys = Object.keys(hebrew).map(k => parseInt(k.slice(1)));
    const greekKeys = Object.keys(greek).map(k => parseInt(k.slice(1)));

    return {
      hebrewCount: hebrewKeys.length,
      greekCount: greekKeys.length,
      hebrewRange: {
        min: Math.min(...hebrewKeys),
        max: Math.max(...hebrewKeys)
      },
      greekRange: {
        min: Math.min(...greekKeys),
        max: Math.max(...greekKeys)
      }
    };
  }
};

/**
 * Normalize a Strong's number to the standard format
 * @param number - Input number (can be "H1", "1", 1, etc.)
 * @param defaultPrefix - Prefix to use if none provided ("H" or "G")
 */
function normalizeStrongsNumber(
  number: string | number,
  defaultPrefix: 'H' | 'G'
): string {
  const str = String(number).toUpperCase().trim();
  
  if (str.startsWith('H') || str.startsWith('G')) {
    return str;
  }
  
  return `${defaultPrefix}${str}`;
}

export default strongsService;
