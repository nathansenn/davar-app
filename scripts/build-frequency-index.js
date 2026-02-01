#!/usr/bin/env node
/**
 * Build Strong's Frequency Index
 * 
 * This script generates the frequency-index.json from tagged Bible texts.
 * 
 * Usage:
 *   node scripts/build-frequency-index.js [--source oshb|sblgnt|custom]
 * 
 * Sources:
 *   - oshb: Open Scriptures Hebrew Bible (OT)
 *   - sblgnt: SBL Greek New Testament (NT)
 *   - custom: Custom tagged text files
 * 
 * Currently uses pre-computed data from scholarly sources.
 * To use with actual tagged texts, implement the parsers below.
 */

const fs = require('fs');
const path = require('path');

// Book ID mappings
const BOOK_IDS = {
  // OT
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT', '1Sam': '1SA', '2Sam': '2SA',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH', 'Ezra': 'EZR',
  'Neh': 'NEH', 'Esth': 'EST', 'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO',
  'Eccl': 'ECC', 'Song': 'SNG', 'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM',
  'Ezek': 'EZK', 'Dan': 'DAN', 'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO',
  'Obad': 'OBA', 'Jonah': 'JON', 'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB',
  'Zeph': 'ZEP', 'Hag': 'HAG', 'Zech': 'ZEC', 'Mal': 'MAL',
  // NT
  'Matt': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Rom': 'ROM', '1Cor': '1CO', '2Cor': '2CO', 'Gal': 'GAL', 'Eph': 'EPH',
  'Phil': 'PHP', 'Col': 'COL', '1Thess': '1TH', '2Thess': '2TH',
  '1Tim': '1TI', '2Tim': '2TI', 'Titus': 'TIT', 'Phlm': 'PHM', 'Heb': 'HEB',
  'Jas': 'JAS', '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN',
  '3John': '3JN', 'Jude': 'JUD', 'Rev': 'REV',
};

class FrequencyIndexBuilder {
  constructor() {
    this.frequencies = {};
  }

  /**
   * Add an occurrence of a Strong's number in a book
   */
  addOccurrence(strongsNumber, bookId, isOT = true) {
    if (!strongsNumber) return;
    
    const normalized = strongsNumber.toUpperCase();
    
    if (!this.frequencies[normalized]) {
      this.frequencies[normalized] = {
        total: 0,
        ot: 0,
        nt: 0,
        bookCounts: {},
      };
    }
    
    const entry = this.frequencies[normalized];
    entry.total++;
    
    if (isOT) {
      entry.ot++;
    } else {
      entry.nt++;
    }
    
    entry.bookCounts[bookId] = (entry.bookCounts[bookId] || 0) + 1;
  }

  /**
   * Parse OSHB (Open Scriptures Hebrew Bible) format
   * The OSHB uses XML with Strong's numbers in attributes
   */
  parseOSHB(filePath) {
    // TODO: Implement OSHB XML parsing
    // Format: <w lemma="H1234" morph="...">word</w>
    console.log('OSHB parsing not yet implemented. Using pre-computed data.');
  }

  /**
   * Parse SBLGNT or tagged Greek NT
   */
  parseSBLGNT(filePath) {
    // TODO: Implement SBLGNT parsing
    console.log('SBLGNT parsing not yet implemented. Using pre-computed data.');
  }

  /**
   * Generate the frequency index JSON
   */
  generateIndex() {
    const output = {
      version: '1.0',
      description: 'Strong\'s word frequency data',
      generatedAt: new Date().toISOString(),
      frequencies: {},
    };

    for (const [strongsNum, data] of Object.entries(this.frequencies)) {
      // Sort books by frequency and take top 5
      const topBooks = Object.entries(data.bookCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([book, count]) => ({ book, count }));

      output.frequencies[strongsNum] = {
        total: data.total,
        ot: data.ot,
        nt: data.nt,
        topBooks,
      };
    }

    return output;
  }

  /**
   * Write the index to file
   */
  writeIndex(outputPath) {
    const index = this.generateIndex();
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    console.log(`Written frequency index to ${outputPath}`);
    console.log(`Total words indexed: ${Object.keys(index.frequencies).length}`);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const source = args.includes('--source') 
    ? args[args.indexOf('--source') + 1] 
    : 'precomputed';

  const builder = new FrequencyIndexBuilder();
  
  if (source === 'oshb') {
    // Parse OSHB files
    const oshbPath = path.join(__dirname, '../data/oshb');
    if (fs.existsSync(oshbPath)) {
      builder.parseOSHB(oshbPath);
    } else {
      console.log('OSHB data not found. Download from: https://github.com/openscriptures/morphhb');
    }
  } else if (source === 'sblgnt') {
    // Parse SBLGNT files
    const sblgntPath = path.join(__dirname, '../data/sblgnt');
    if (fs.existsSync(sblgntPath)) {
      builder.parseSBLGNT(sblgntPath);
    } else {
      console.log('SBLGNT data not found.');
    }
  } else {
    console.log('Using pre-computed frequency data from scholarly sources.');
    console.log('To generate from tagged texts, use: --source oshb or --source sblgnt');
    console.log('');
    console.log('Current frequency-index.json contains data for common words.');
    console.log('For complete coverage, download and parse OSHB/SBLGNT.');
  }

  // If we have data, write it
  if (Object.keys(builder.frequencies).length > 0) {
    const outputPath = path.join(__dirname, '../assets/strongs/frequency-index.json');
    builder.writeIndex(outputPath);
  }
}

module.exports = { FrequencyIndexBuilder, BOOK_IDS };
