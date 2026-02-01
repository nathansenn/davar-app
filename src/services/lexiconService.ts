/**
 * Lexicon Service
 * Enhanced word study data including morphology, frequency, and cross-references
 */

// Morphological code parsing for Hebrew and Greek

interface MorphologyParsed {
  partOfSpeech: string;
  details: string[];
  fullDescription: string;
}

// Hebrew morphology codes (based on OSHM - Open Scriptures Hebrew Morphology)
const HEBREW_POS: Record<string, string> = {
  'A': 'Adjective',
  'C': 'Conjunction',
  'D': 'Adverb',
  'N': 'Noun',
  'P': 'Pronoun',
  'R': 'Preposition',
  'S': 'Suffix',
  'T': 'Particle',
  'V': 'Verb',
};

const HEBREW_VERB_STEMS: Record<string, string> = {
  'q': 'Qal',
  'N': 'Niphal',
  'p': 'Piel',
  'P': 'Pual',
  'h': 'Hiphil',
  'H': 'Hophal',
  't': 'Hithpael',
  'o': 'Polel',
  'O': 'Polal',
  'r': 'Hithpolel',
  'm': 'Poel',
  'M': 'Poal',
  'k': 'Palel',
  'K': 'Pulal',
  'Q': 'Qal Passive',
  'l': 'Pilpel',
  'L': 'Polpal',
  'f': 'Hithpalpel',
  'D': 'Nithpael',
  'j': 'Pealal',
  'i': 'Pilel',
  'u': 'Hothpaal',
  'c': 'Tiphil',
  'v': 'Hishtaphel',
  'w': 'Nithpalel',
  'y': 'Nithpoel',
  'z': 'Hithpoel',
};

const HEBREW_ASPECTS: Record<string, string> = {
  'p': 'Perfect',
  'q': 'Sequential Perfect',
  'i': 'Imperfect',
  'w': 'Sequential Imperfect',
  'h': 'Cohortative',
  'j': 'Jussive',
  'v': 'Imperative',
  'r': 'Infinitive Construct',
  's': 'Infinitive Absolute',
  'a': 'Participle Active',
  'e': 'Participle Passive',
};

const HEBREW_PERSON: Record<string, string> = {
  '1': '1st person',
  '2': '2nd person',
  '3': '3rd person',
};

const HEBREW_GENDER: Record<string, string> = {
  'm': 'masculine',
  'f': 'feminine',
  'b': 'both',
  'c': 'common',
};

const HEBREW_NUMBER: Record<string, string> = {
  's': 'singular',
  'p': 'plural',
  'd': 'dual',
};

const HEBREW_STATE: Record<string, string> = {
  'a': 'absolute',
  'c': 'construct',
  'd': 'determined',
};

// Greek morphology codes (based on Robinson's morphology)
const GREEK_POS: Record<string, string> = {
  'N': 'Noun',
  'V': 'Verb',
  'A': 'Adjective',
  'D': 'Adverb',
  'P': 'Pronoun',
  'C': 'Conjunction',
  'T': 'Article',
  'R': 'Preposition',
  'I': 'Interjection',
  'X': 'Particle',
};

const GREEK_TENSES: Record<string, string> = {
  'P': 'Present',
  'I': 'Imperfect',
  'F': 'Future',
  'A': 'Aorist',
  'R': 'Perfect',
  'L': 'Pluperfect',
  '2': 'Second',
};

const GREEK_VOICES: Record<string, string> = {
  'A': 'Active',
  'M': 'Middle',
  'P': 'Passive',
  'E': 'Middle/Passive (Deponent)',
  'D': 'Middle (Deponent)',
  'O': 'Passive (Deponent)',
  'N': 'Middle/Passive (No voice)',
};

const GREEK_MOODS: Record<string, string> = {
  'I': 'Indicative',
  'S': 'Subjunctive',
  'O': 'Optative',
  'M': 'Imperative',
  'N': 'Infinitive',
  'P': 'Participle',
  'R': 'Imperative (Rare)',
};

const GREEK_CASES: Record<string, string> = {
  'N': 'Nominative',
  'G': 'Genitive',
  'D': 'Dative',
  'A': 'Accusative',
  'V': 'Vocative',
};

const GREEK_PERSON: Record<string, string> = {
  '1': '1st person',
  '2': '2nd person',
  '3': '3rd person',
};

const GREEK_NUMBER: Record<string, string> = {
  'S': 'Singular',
  'P': 'Plural',
};

const GREEK_GENDER: Record<string, string> = {
  'M': 'Masculine',
  'F': 'Feminine',
  'N': 'Neuter',
};

/**
 * Parse Hebrew morphology code
 */
function parseHebrewMorphology(code: string): MorphologyParsed | null {
  if (!code || code.length < 1) return null;
  
  const details: string[] = [];
  const pos = HEBREW_POS[code[0]];
  if (!pos) return null;
  
  details.push(pos);
  
  if (code[0] === 'V' && code.length >= 2) {
    // Verb parsing
    const stem = HEBREW_VERB_STEMS[code[1]];
    if (stem) details.push(stem);
    
    if (code.length >= 3) {
      const aspect = HEBREW_ASPECTS[code[2]];
      if (aspect) details.push(aspect);
    }
    
    if (code.length >= 4) {
      const person = HEBREW_PERSON[code[3]];
      if (person) details.push(person);
    }
    
    if (code.length >= 5) {
      const gender = HEBREW_GENDER[code[4]];
      if (gender) details.push(gender);
    }
    
    if (code.length >= 6) {
      const number = HEBREW_NUMBER[code[5]];
      if (number) details.push(number);
    }
  } else if ((code[0] === 'N' || code[0] === 'A') && code.length >= 2) {
    // Noun/Adjective parsing
    if (code.length >= 2) {
      const gender = HEBREW_GENDER[code[1]];
      if (gender) details.push(gender);
    }
    if (code.length >= 3) {
      const number = HEBREW_NUMBER[code[2]];
      if (number) details.push(number);
    }
    if (code.length >= 4) {
      const state = HEBREW_STATE[code[3]];
      if (state) details.push(state);
    }
  }
  
  return {
    partOfSpeech: pos,
    details: details.slice(1),
    fullDescription: details.join(', '),
  };
}

/**
 * Parse Greek morphology code (Robinson format)
 */
function parseGreekMorphology(code: string): MorphologyParsed | null {
  if (!code || code.length < 1) return null;
  
  // Handle hyphenated codes like "V-PAI-3S"
  const parts = code.split('-');
  const details: string[] = [];
  
  const pos = GREEK_POS[parts[0]?.[0] || ''];
  if (!pos) return null;
  
  details.push(pos);
  
  if (parts[0]?.[0] === 'V' && parts.length >= 2) {
    // Verb parsing - format: V-TENSE-VOICE-MOOD-PERSON-NUMBER
    const verbCode = parts[1] || '';
    
    if (verbCode.length >= 1) {
      const tense = GREEK_TENSES[verbCode[0]];
      if (tense) details.push(tense);
    }
    if (verbCode.length >= 2) {
      const voice = GREEK_VOICES[verbCode[1]];
      if (voice) details.push(voice);
    }
    if (verbCode.length >= 3) {
      const mood = GREEK_MOODS[verbCode[2]];
      if (mood) details.push(mood);
    }
    
    if (parts.length >= 3) {
      const personNum = parts[2] || '';
      if (personNum.length >= 1) {
        const person = GREEK_PERSON[personNum[0]];
        if (person) details.push(person);
      }
      if (personNum.length >= 2) {
        const number = GREEK_NUMBER[personNum[1]];
        if (number) details.push(number);
      }
    }
  } else if ((parts[0]?.[0] === 'N' || parts[0]?.[0] === 'A') && parts.length >= 2) {
    // Noun/Adjective parsing - format: N-CASE-NUMBER-GENDER
    const nounCode = parts[1] || '';
    
    if (nounCode.length >= 1) {
      const caseVal = GREEK_CASES[nounCode[0]];
      if (caseVal) details.push(caseVal);
    }
    if (nounCode.length >= 2) {
      const number = GREEK_NUMBER[nounCode[1]];
      if (number) details.push(number);
    }
    if (nounCode.length >= 3) {
      const gender = GREEK_GENDER[nounCode[2]];
      if (gender) details.push(gender);
    }
  }
  
  return {
    partOfSpeech: pos,
    details: details.slice(1),
    fullDescription: details.join(', '),
  };
}

export interface WordFrequency {
  total: number;
  ot: number;
  nt: number;
  books: { bookId: string; count: number }[];
}

export interface RelatedWord {
  strongsNumber: string;
  lemma: string;
  relationship: 'root' | 'cognate' | 'derivative' | 'synonym' | 'antonym';
  description?: string;
}

export interface CrossReference {
  reference: string;
  text: string;
  relevance: 'primary' | 'secondary';
}

export interface EnhancedWordData {
  morphology?: MorphologyParsed;
  frequency?: WordFrequency;
  relatedWords?: RelatedWord[];
  crossReferences?: CrossReference[];
  semanticDomain?: string;
  usageNotes?: string;
}

class LexiconService {
  /**
   * Parse morphology code into human-readable format
   */
  parseMorphology(code: string, language: 'hebrew' | 'greek'): MorphologyParsed | null {
    if (language === 'hebrew') {
      return parseHebrewMorphology(code);
    } else {
      return parseGreekMorphology(code);
    }
  }
  
  /**
   * Get word frequency data (mock - would connect to a database)
   * TODO: Implement actual frequency lookup from indexed data
   */
  async getWordFrequency(strongsNumber: string): Promise<WordFrequency | null> {
    // Common word frequencies (sample data)
    const frequencies: Record<string, WordFrequency> = {
      'H430': { total: 2606, ot: 2606, nt: 0, books: [
        { bookId: 'GEN', count: 218 },
        { bookId: 'PSA', count: 365 },
        { bookId: 'ISA', count: 114 },
      ]},
      'H3068': { total: 6519, ot: 6519, nt: 0, books: [
        { bookId: 'PSA', count: 695 },
        { bookId: 'JER', count: 726 },
        { bookId: 'EZK', count: 434 },
      ]},
      'H1': { total: 1210, ot: 1210, nt: 0, books: [
        { bookId: 'GEN', count: 158 },
        { bookId: 'EXO', count: 68 },
        { bookId: 'DEU', count: 82 },
      ]},
      'G2316': { total: 1343, ot: 0, nt: 1343, books: [
        { bookId: 'ROM', count: 153 },
        { bookId: 'JHN', count: 83 },
        { bookId: 'ACT', count: 166 },
      ]},
      'G2424': { total: 983, ot: 0, nt: 983, books: [
        { bookId: 'MAT', count: 152 },
        { bookId: 'LUK', count: 89 },
        { bookId: 'JHN', count: 244 },
      ]},
      'G26': { total: 116, ot: 0, nt: 116, books: [
        { bookId: 'JHN', count: 30 },
        { bookId: '1JN', count: 18 },
        { bookId: 'ROM', count: 9 },
      ]},
    };
    
    return frequencies[strongsNumber.toUpperCase()] || null;
  }
  
  /**
   * Get related words (roots, cognates, etc.)
   */
  async getRelatedWords(strongsNumber: string): Promise<RelatedWord[]> {
    const relations: Record<string, RelatedWord[]> = {
      'H26': [  // אַהֲבָה (love)
        { strongsNumber: 'H157', lemma: 'אָהֵב', relationship: 'root', description: 'to love' },
        { strongsNumber: 'H158', lemma: 'אַהַב', relationship: 'cognate', description: 'love (noun)' },
        { strongsNumber: 'H160', lemma: 'אַהֲבָה', relationship: 'synonym', description: 'love, beloved' },
      ],
      'G26': [  // ἀγάπη (agape)
        { strongsNumber: 'G25', lemma: 'ἀγαπάω', relationship: 'root', description: 'to love' },
        { strongsNumber: 'G27', lemma: 'ἀγαπητός', relationship: 'derivative', description: 'beloved' },
        { strongsNumber: 'G5368', lemma: 'φιλέω', relationship: 'synonym', description: 'to love (affectionately)' },
      ],
      'G2316': [ // θεός (God)
        { strongsNumber: 'G2304', lemma: 'θεῖος', relationship: 'derivative', description: 'divine' },
        { strongsNumber: 'G2305', lemma: 'θειότης', relationship: 'derivative', description: 'divinity' },
        { strongsNumber: 'G2319', lemma: 'θεοστυγής', relationship: 'derivative', description: 'God-hater' },
      ],
      'H430': [ // אֱלֹהִים (Elohim)
        { strongsNumber: 'H433', lemma: 'אֱלוֹהַּ', relationship: 'root', description: 'God (singular)' },
        { strongsNumber: 'H410', lemma: 'אֵל', relationship: 'cognate', description: 'God, mighty one' },
        { strongsNumber: 'H426', lemma: 'אֱלָהּ', relationship: 'cognate', description: 'God (Aramaic)' },
      ],
    };
    
    return relations[strongsNumber.toUpperCase()] || [];
  }
  
  /**
   * Get key verses where this word appears
   */
  async getCrossReferences(strongsNumber: string): Promise<CrossReference[]> {
    const refs: Record<string, CrossReference[]> = {
      'G26': [
        { reference: 'John 3:16', text: 'For God so loved the world...', relevance: 'primary' },
        { reference: '1 John 4:8', text: 'God is love', relevance: 'primary' },
        { reference: '1 Cor 13:13', text: 'And now these three remain: faith, hope and love...', relevance: 'primary' },
        { reference: 'Romans 5:8', text: 'But God demonstrates his own love for us...', relevance: 'secondary' },
      ],
      'G2316': [
        { reference: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God...', relevance: 'primary' },
        { reference: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth', relevance: 'primary' },
        { reference: '1 John 4:8', text: 'God is love', relevance: 'secondary' },
      ],
      'H3068': [
        { reference: 'Exodus 3:14', text: 'I AM WHO I AM', relevance: 'primary' },
        { reference: 'Psalm 23:1', text: 'The LORD is my shepherd', relevance: 'primary' },
        { reference: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God, the LORD is one', relevance: 'primary' },
      ],
    };
    
    return refs[strongsNumber.toUpperCase()] || [];
  }
  
  /**
   * Get enhanced word data combining all sources
   */
  async getEnhancedWordData(
    strongsNumber: string,
    morphCode?: string,
    language: 'hebrew' | 'greek' = 'greek'
  ): Promise<EnhancedWordData> {
    const [frequency, relatedWords, crossReferences] = await Promise.all([
      this.getWordFrequency(strongsNumber),
      this.getRelatedWords(strongsNumber),
      this.getCrossReferences(strongsNumber),
    ]);
    
    const morphology = morphCode 
      ? this.parseMorphology(morphCode, language) 
      : null;
    
    return {
      morphology: morphology || undefined,
      frequency: frequency || undefined,
      relatedWords: relatedWords.length > 0 ? relatedWords : undefined,
      crossReferences: crossReferences.length > 0 ? crossReferences : undefined,
    };
  }
}

export const lexiconService = new LexiconService();
export { parseHebrewMorphology, parseGreekMorphology };
