/**
 * Document Analysis Engine
 * Detects formatting issues, duplicates, anomalies, and provides actionable suggestions
 */

const DocumentAnalysisEngine = (function() {
  
  /**
   * Analyzes the current document and returns detected issues
   * @returns {Object} Analysis results with issues and suggestions
   */
  function analyzeDocument() {
    try {
      const docType = getDocumentType();
      
      switch(docType) {
        case 'SPREADSHEET':
          return analyzeSpreadsheet();
        case 'DOCUMENT':
          return analyzeDoc();
        case 'PRESENTATION':
          return analyzeSlides();
        default:
          return { issues: [], suggestions: [] };
      }
    } catch (e) {
      console.error('Error analyzing document:', e);
      return { issues: ['Error analyzing document: ' + e.message], suggestions: [] };
    }
  }
  
  /**
   * Analyzes a Google Sheets document
   * @returns {Object} Analysis results
   */
  function analyzeSpreadsheet() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const issues = [];
    const suggestions = [];
    
    if (values.length === 0) {
      return { issues: ['Sheet is empty'], suggestions: [] };
    }
    
    // Check for empty rows
    const emptyRows = findEmptyRows(values);
    if (emptyRows.length > 0) {
      issues.push(`Found ${emptyRows.length} empty row(s)`);
      suggestions.push('Remove empty rows to clean up your data');
    }
    
    // Check for duplicate rows
    const duplicates = findDuplicateRows(values);
    if (duplicates.length > 0) {
      issues.push(`Found ${duplicates.length} duplicate row(s)`);
      suggestions.push('Remove duplicate rows to improve data quality');
    }
    
    // Check for date format inconsistencies
    const dateIssues = checkDateFormats(values);
    if (dateIssues.length > 0) {
      issues.push(`Found ${dateIssues.length} date format inconsistency(ies)`);
      suggestions.push('Standardize date formats across columns');
    }
    
    // Check for mixed data types in columns
    const mixedTypes = findMixedDataTypes(values);
    if (mixedTypes.length > 0) {
      mixedTypes.forEach(col => {
        issues.push(`Column ${col.column} has mixed data types`);
      });
      suggestions.push('Clean columns to have consistent data types');
    }
    
    // Check for empty cells in data range
    const emptyCells = countEmptyCells(values);
    if (emptyCells > 0) {
      issues.push(`Found ${emptyCells} empty cell(s) in data range`);
      suggestions.push('Fill empty cells with appropriate values');
    }
    
    return { issues, suggestions };
  }
  
  /**
   * Analyzes a Google Docs document
   * @returns {Object} Analysis results
   */
  function analyzeDoc() {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    const text = body.getText();
    const issues = [];
    const suggestions = [];
    
    if (text.trim().length === 0) {
      return { issues: ['Document is empty'], suggestions: [] };
    }
    
    // Check for inconsistent heading styles
    const headingIssues = checkHeadingConsistency(body);
    if (headingIssues.length > 0) {
      issues.push(`Found ${headingIssues.length} heading format inconsistency(ies)`);
      suggestions.push('Standardize heading styles for better readability');
    }
    
    // Check for multiple consecutive spaces
    const multipleSpaces = checkMultipleSpaces(text);
    if (multipleSpaces.count > 0) {
      issues.push(`Found ${multipleSpaces.count} instance(s) of multiple consecutive spaces`);
      suggestions.push('Remove extra spaces for cleaner formatting');
    }
    
    // Check for spacing issues around punctuation
    const spacingIssues = checkPunctuationSpacing(text);
    if (spacingIssues.length > 0) {
      issues.push(`Found ${spacingIssues.length} spacing issue(s) around punctuation`);
      suggestions.push('Fix spacing before/after punctuation marks');
    }
    
    // Check for capitalization errors
    const capIssues = checkCapitalization(text);
    if (capIssues.length > 0) {
      issues.push(`Found ${capIssues.length} capitalization error(s)`);
      suggestions.push('Fix random or inconsistent capitalization');
    }
    
    // Check for spelling mistakes
    const spellingErrors = checkSpelling(text);
    if (spellingErrors.length > 0) {
      issues.push(`Found ${spellingErrors.length} potential spelling mistake(s)`);
      suggestions.push('Review and correct spelling errors');
    }
    
    // Check for sentence structure problems
    const sentenceIssues = checkSentenceStructure(text);
    if (sentenceIssues.length > 0) {
      issues.push(`Found ${sentenceIssues.length} sentence structure issue(s)`);
      suggestions.push('Review sentences for proper punctuation and structure');
    }
    
    // Check for inconsistent bullet/numbering
    const listIssues = checkListFormatting(body);
    if (listIssues.length > 0) {
      issues.push('Found inconsistent list formatting');
      suggestions.push('Standardize bullet points and numbering');
    }
    
    // Check for very long paragraphs
    const longParagraphs = findLongParagraphs(body);
    if (longParagraphs.length > 0) {
      issues.push(`Found ${longParagraphs.length} very long paragraph(s)`);
      suggestions.push('Consider breaking up long paragraphs for readability');
    }
    
    return { issues, suggestions };
  }
  
  /**
   * Analyzes a Google Slides presentation
   * @returns {Object} Analysis results
   */
  function analyzeSlides() {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const issues = [];
    const suggestions = [];
    
    if (slides.length === 0) {
      return { issues: ['Presentation is empty'], suggestions: [] };
    }
    
    // Check for slides with too much text
    const textHeavySlides = findTextHeavySlides(slides);
    if (textHeavySlides.length > 0) {
      issues.push(`Found ${textHeavySlides.length} slide(s) with too much text`);
      suggestions.push('Reduce text density for better visual impact');
    }
    
    // Check for inconsistent fonts
    const fontIssues = checkFontConsistency(slides);
    if (fontIssues.length > 0) {
      issues.push('Found inconsistent font usage across slides');
      suggestions.push('Standardize fonts for professional appearance');
    }
    
    // Check for missing speaker notes
    const slidesWithoutNotes = findSlidesWithoutNotes(slides);
    if (slidesWithoutNotes.length > slides.length * 0.5) {
      issues.push(`${slidesWithoutNotes.length} slides missing speaker notes`);
      suggestions.push('Add speaker notes for better presentation delivery');
    }
    
    return { issues, suggestions };
  }
  
  // Helper functions for Sheets analysis
  
  function findEmptyRows(values) {
    const emptyRows = [];
    values.forEach((row, index) => {
      if (row.every(cell => cell === '' || cell === null || cell === undefined)) {
        emptyRows.push(index + 1);
      }
    });
    return emptyRows;
  }
  
  function findDuplicateRows(values) {
    const seen = new Map();
    const duplicates = [];
    
    values.forEach((row, index) => {
      const rowKey = JSON.stringify(row);
      if (seen.has(rowKey)) {
        duplicates.push(index + 1);
      } else {
        seen.set(rowKey, index + 1);
      }
    });
    
    return duplicates;
  }
  
  function checkDateFormats(values) {
    const dateIssues = [];
    const datePatterns = [];
    
    // Transpose to get columns
    const columns = values[0].map((_, colIndex) => values.map(row => row[colIndex]));
    
    columns.forEach((column, colIndex) => {
      const dates = column.filter(cell => isDateLike(cell));
      if (dates.length > 1) {
        const formats = dates.map(d => detectDateFormat(d));
        const uniqueFormats = [...new Set(formats)];
        if (uniqueFormats.length > 1) {
          dateIssues.push({ column: colIndex + 1, formats: uniqueFormats });
        }
      }
    });
    
    return dateIssues;
  }
  
  function findMixedDataTypes(values) {
    const mixedColumns = [];
    
    // Transpose to get columns
    const columns = values[0].map((_, colIndex) => values.map(row => row[colIndex]));
    
    columns.forEach((column, colIndex) => {
      const types = new Set();
      column.forEach(cell => {
        if (cell !== '' && cell !== null && cell !== undefined) {
          types.add(typeof cell);
        }
      });
      if (types.size > 1) {
        mixedColumns.push({ column: colIndex + 1, types: Array.from(types) });
      }
    });
    
    return mixedColumns;
  }
  
  function countEmptyCells(values) {
    let count = 0;
    values.forEach(row => {
      row.forEach(cell => {
        if (cell === '' || cell === null || cell === undefined) {
          count++;
        }
      });
    });
    return count;
  }
  
  function isDateLike(value) {
    if (value instanceof Date) return true;
    if (typeof value !== 'string') return false;
    
    // Check common date patterns
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{2,4}$/,
    ];
    
    return datePatterns.some(pattern => pattern.test(value));
  }
  
  function detectDateFormat(value) {
    if (value instanceof Date) return 'Date object';
    if (typeof value !== 'string') return 'unknown';
    
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) return 'MM/DD/YYYY';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'YYYY-MM-DD';
    if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(value)) return 'MM-DD-YYYY';
    
    return 'unknown';
  }
  
  // Helper functions for Docs analysis
  
  function checkHeadingConsistency(body) {
    const issues = [];
    const paragraphs = body.getParagraphs();
    const headingStyles = new Map();
    
    paragraphs.forEach((para, index) => {
      const heading = para.getHeading();
      if (heading !== DocumentApp.ParagraphHeading.NORMAL) {
        const fontSize = para.editAsText().getFontSize(0);
        const key = heading.toString();
        
        if (headingStyles.has(key)) {
          if (headingStyles.get(key) !== fontSize) {
            issues.push(index);
          }
        } else {
          headingStyles.set(key, fontSize);
        }
      }
    });
    
    return issues;
  }
  
  function checkListFormatting(body) {
    const issues = [];
    const paragraphs = body.getParagraphs();
    let currentListId = null;
    let expectedNesting = 0;
    
    paragraphs.forEach((para, index) => {
      const listId = para.getListId();
      if (listId) {
        const nesting = para.getNestingLevel();
        if (currentListId === listId) {
          if (Math.abs(nesting - expectedNesting) > 1) {
            issues.push(index);
          }
        }
        currentListId = listId;
        expectedNesting = nesting;
      }
    });
    
    return issues;
  }
  
  function findLongParagraphs(body) {
    const longParagraphs = [];
    const paragraphs = body.getParagraphs();
    const LONG_THRESHOLD = 500; // characters
    
    paragraphs.forEach((para, index) => {
      const text = para.getText();
      if (text.length > LONG_THRESHOLD && para.getHeading() === DocumentApp.ParagraphHeading.NORMAL) {
        longParagraphs.push(index);
      }
    });
    
    return longParagraphs;
  }
  
  /**
   * Checks for multiple consecutive spaces
   * @param {string} text - Document text
   * @returns {Object} Count and examples
   */
  function checkMultipleSpaces(text) {
    const matches = text.match(/\s{2,}/g);
    return {
      count: matches ? matches.length : 0,
      examples: matches ? matches.slice(0, 3) : []
    };
  }
  
  /**
   * Checks for spacing issues around punctuation
   * @param {string} text - Document text
   * @returns {Array} Array of spacing issues
   */
  function checkPunctuationSpacing(text) {
    const issues = [];
    
    // Space before comma, period, question mark, exclamation
    const spaceBefore = text.match(/\s+[,.!?;:]/g);
    if (spaceBefore && spaceBefore.length > 0) {
      issues.push({ type: 'space_before_punctuation', count: spaceBefore.length });
    }
    
    // Missing space after comma, period (but not in numbers or ellipsis)
    const missingAfterComma = text.match(/,[^\s\d]/g);
    if (missingAfterComma && missingAfterComma.length > 0) {
      issues.push({ type: 'missing_space_after_comma', count: missingAfterComma.length });
    }
    
    // Missing space after period (but not in abbreviations, ellipsis, or decimals)
    const missingAfterPeriod = text.match(/\.(?![\s\d\.\)])[A-Z]/g);
    if (missingAfterPeriod && missingAfterPeriod.length > 0) {
      issues.push({ type: 'missing_space_after_period', count: missingAfterPeriod.length });
    }
    
    return issues;
  }
  
  /**
   * Checks for capitalization errors
   * @param {string} text - Document text
   * @returns {Array} Array of capitalization issues
   */
  function checkCapitalization(text) {
    const issues = [];
    
    // Split into sentences
    const sentences = text.split(/[.!?]+\s+/);
    
    sentences.forEach((sentence, index) => {
      if (sentence.trim().length === 0) return;
      
      // Check if sentence starts with lowercase (excluding quotes, parentheses, etc.)
      const firstWord = sentence.trim().match(/^["'(\[]*([a-z])/i);
      if (firstWord && firstWord[1] && firstWord[1] === firstWord[1].toLowerCase()) {
        issues.push({ type: 'lowercase_sentence_start', sentence: index });
      }
      
      // Check for random mid-sentence capitals (words starting with capital not after period)
      // Exclude: proper nouns indicators, acronyms, and common abbreviations
      const randomCaps = sentence.match(/(?<!\. )(?<!^)\b[A-Z][a-z]+(?:[A-Z][a-z]+)+/g);
      if (randomCaps && randomCaps.length > 0) {
        // Filter out likely proper nouns (for now, just count them)
        const suspiciousCaps = randomCaps.filter(word => {
          // Keep as issue if it looks like a common word incorrectly capitalized
          return word.length > 2 && /^[A-Z][a-z]+[A-Z]/.test(word);
        });
        if (suspiciousCaps.length > 0) {
          issues.push({ type: 'mid_sentence_capitals', count: suspiciousCaps.length });
        }
      }
      
      // Check for inconsistent capitalization of the same word
      const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/gi);
      if (words) {
        const wordMap = {};
        sentence.match(/\b[A-Za-z]{3,}\b/g)?.forEach(word => {
          const lower = word.toLowerCase();
          if (!wordMap[lower]) {
            wordMap[lower] = [];
          }
          wordMap[lower].push(word);
        });
        
        // Check for same word with different capitalizations
        Object.keys(wordMap).forEach(lower => {
          const variations = [...new Set(wordMap[lower])];
          if (variations.length > 1 && !isLikelyProperNoun(lower)) {
            issues.push({ type: 'inconsistent_capitalization', word: lower });
          }
        });
      }
    });
    
    return issues;
  }
  
  /**
   * Checks if a word is likely a proper noun
   * @param {string} word - Word to check
   * @returns {boolean}
   */
  function isLikelyProperNoun(word) {
    // Simple heuristic: very short words, or common abbreviations
    const properNouns = ['i', 'january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december',
                        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return word.length < 3 || properNouns.includes(word.toLowerCase());
  }
  
  /**
   * Checks for spelling mistakes using common patterns
   * @param {string} text - Document text
   * @returns {Array} Array of potential spelling errors
   */
  function checkSpelling(text) {
    const issues = [];
    
    // Common misspellings dictionary
    const commonMisspellings = {
      'teh': 'the',
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
      'begining': 'beginning',
      'untill': 'until',
      'writting': 'writing',
      'occassion': 'occasion',
      'tommorrow': 'tomorrow',
      'acheive': 'achieve',
      'beleive': 'believe',
      'calender': 'calendar',
      'enviroment': 'environment',
      'goverment': 'government',
      'greatful': 'grateful',
      'harrass': 'harass',
      'maintenence': 'maintenance',
      'neccessary': 'necessary',
      'occassionally': 'occasionally',
      'posession': 'possession',
      'recomend': 'recommend',
      'refered': 'referred',
      'relevent': 'relevant',
      'sincerly': 'sincerely',
      'sucessful': 'successful',
      'thier': 'their',
      'wierd': 'weird',
      'accross': 'across',
      'adress': 'address',
      'alot': 'a lot',
      'arguement': 'argument',
      'basicly': 'basically',
      'comming': 'coming',
      'completly': 'completely',
      'concious': 'conscious',
      'dissapear': 'disappear',
      'embarass': 'embarrass',
      'exagerate': 'exaggerate',
      'existance': 'existence',
      'foriegn': 'foreign',
      'hieght': 'height',
      'humerous': 'humorous',
      'immediatly': 'immediately',
      'incidently': 'incidentally',
      'independant': 'independent',
      'knowlege': 'knowledge',
      'lisence': 'license',
      'noticable': 'noticeable',
      'occuring': 'occurring',
      'parallel': 'parallel',
      'persue': 'pursue',
      'preceed': 'precede',
      'prefered': 'preferred',
      'priviledge': 'privilege',
      'publically': 'publicly',
      'reccomend': 'recommend',
      'rythm': 'rhythm',
      'sence': 'sense',
      'succesful': 'successful',
      'suprise': 'surprise',
      'tendancy': 'tendency',
      'therefor': 'therefore',
      'truely': 'truly',
      'unfortunatly': 'unfortunately',
      'useable': 'usable'
    };
    
    // Extract words from text
    const words = text.toLowerCase().match(/\b[a-z]+\b/gi);
    if (!words) return issues;
    
    const foundErrors = new Set();
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (commonMisspellings[lower] && !foundErrors.has(lower)) {
        foundErrors.add(lower);
        issues.push({ 
          word: lower, 
          suggestion: commonMisspellings[lower],
          type: 'common_misspelling'
        });
      }
    });
    
    // Check for repeated words (e.g., "the the")
    const repeatedWords = text.match(/\b(\w+)\s+\1\b/gi);
    if (repeatedWords && repeatedWords.length > 0) {
      repeatedWords.forEach(match => {
        if (!foundErrors.has('repeated_' + match.toLowerCase())) {
          foundErrors.add('repeated_' + match.toLowerCase());
          issues.push({
            word: match.trim(),
            type: 'repeated_word'
          });
        }
      });
    }
    
    return issues;
  }
  
  /**
   * Checks for sentence structure problems
   * @param {string} text - Document text
   * @returns {Array} Array of sentence structure issues
   */
  function checkSentenceStructure(text) {
    const issues = [];
    
    // Split into sentences more carefully
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return;
      
      // Check for sentences that don't start with a capital letter
      if (trimmed.length > 0 && /^[a-z]/.test(trimmed)) {
        issues.push({ type: 'no_capital_start', index: index });
      }
      
      // Check for very short "sentences" that might be incomplete
      if (trimmed.length > 0 && trimmed.length < 3 && index < sentences.length - 1) {
        issues.push({ type: 'incomplete_sentence', index: index });
      }
      
      // Check for run-on sentences (very long without proper punctuation)
      if (trimmed.length > 300 && !/[,;:]/.test(trimmed)) {
        issues.push({ type: 'possible_runon', index: index });
      }
      
      // Check for sentences ending with multiple punctuation marks inappropriately
      if (/[.!?]{3,}/.test(sentence)) {
        issues.push({ type: 'excessive_punctuation', index: index });
      }
    });
    
    // Check for missing periods at paragraph ends
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();
      if (trimmed.length > 10 && !/[.!?]$/.test(trimmed)) {
        issues.push({ type: 'missing_end_punctuation', paragraph: index });
      }
    });
    
    return issues;
  }
  
  // Helper functions for Slides analysis
  
  function findTextHeavySlides(slides) {
    const textHeavy = [];
    const TEXT_THRESHOLD = 200; // characters
    
    slides.forEach((slide, index) => {
      let totalText = 0;
      const shapes = slide.getShapes();
      
      shapes.forEach(shape => {
        if (shape.getText) {
          totalText += shape.getText().asString().length;
        }
      });
      
      if (totalText > TEXT_THRESHOLD) {
        textHeavy.push(index + 1);
      }
    });
    
    return textHeavy;
  }
  
  function checkFontConsistency(slides) {
    const fonts = new Set();
    const issues = [];
    
    slides.forEach(slide => {
      const shapes = slide.getShapes();
      shapes.forEach(shape => {
        if (shape.getText) {
          const text = shape.getText();
          const runs = text.getTextStyle().getFontFamily();
          if (runs) fonts.add(runs);
        }
      });
    });
    
    if (fonts.size > 3) {
      issues.push(`Using ${fonts.size} different fonts`);
    }
    
    return issues;
  }
  
  function findSlidesWithoutNotes(slides) {
    const slidesWithoutNotes = [];
    
    slides.forEach((slide, index) => {
      const notes = slide.getNotesPage();
      if (!notes || notes.getSpeakerNotesShape().getText().asString().trim().length === 0) {
        slidesWithoutNotes.push(index + 1);
      }
    });
    
    return slidesWithoutNotes;
  }
  
  /**
   * Gets the type of current document
   * @returns {string} Document type
   */
  function getDocumentType() {
    try {
      const doc = DocumentApp.getActiveDocument();
      if (doc) return 'DOCUMENT';
    } catch (e) {
      // Not a document
    }
    
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet();
      if (sheet) return 'SPREADSHEET';
    } catch (e) {
      // Not a spreadsheet
    }
    
    try {
      const presentation = SlidesApp.getActivePresentation();
      if (presentation) return 'PRESENTATION';
    } catch (e) {
      // Not a presentation
    }
    
    return 'UNKNOWN';
  }
  
  // Public API
  return {
    analyzeDocument: analyzeDocument,
    getDocumentType: getDocumentType
  };
  
})();
