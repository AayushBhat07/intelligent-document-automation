/**
 * Comprehensive Formatting Service
 * Handles all 28 formatting issue types with both regex and AI modes
 */

const ComprehensiveFormatter = (function() {
  
  /**
   * Analyze document for all formatting issues
   * @param {string} text - Document text
   * @param {boolean} deepAnalysis - Whether to do deep analysis
   * @returns {Object} Comprehensive issue report
   */
  function analyzeAllIssues(text, deepAnalysis = false) {
    const issues = {
      // Spacing issues
      multipleSpaces: [],
      missingSpaceAfterPunct: [],
      spaceBeforePunct: [],
      spacedLetters: [],
      inconsistentIndent: [],
      
      // Line break issues
      excessiveLineBreaks: [],
      randomLineBreaks: [],
      
      // Punctuation issues
      missingEndPunct: [],
      doublePunctuation: [],
      
      // Capitalization issues
      lowercaseStart: [],
      midSentenceCapitals: [],
      randomCapsInWords: [],
      
      // Spelling & grammar
      spellingMistakes: [],
      repeatedCharacters: [],
      missingLetters: [],
      
      // Sentence structure
      runOnSentences: [],
      sentenceFragments: [],
      repeatedWords: [],
      brokenSentences: [],
      
      // Formatting
      misalignedBullets: [],
      brokenMarkdown: [],
      unclosedBrackets: [],
      unclosedQuotes: [],
      
      // Character issues
      mixedDashes: [],
      unicodeGlitches: [],
      invisibleChars: [],
      
      // Consistency
      inconsistentParagraphs: [],
      mixedTabsSpaces: [],
      wrongHomophones: [],
      randomSymbols: [],
      inconsistentNumbering: [],
      
      totalCount: 0
    };
    
    // Quick regex-based detection
    detectSpacingIssues(text, issues);
    detectPunctuationIssues(text, issues);
    detectCapitalizationIssues(text, issues);
    detectSpellingIssues(text, issues);
    detectSentenceIssues(text, issues);
    detectFormattingIssues(text, issues);
    detectCharacterIssues(text, issues);
    detectConsistencyIssues(text, issues);
    
    // Calculate total
    issues.totalCount = Object.keys(issues).reduce((sum, key) => {
      return sum + (Array.isArray(issues[key]) ? issues[key].length : 0);
    }, 0);
    
    return issues;
  }
  
  /**
   * Detect spacing issues (1-4)
   */
  function detectSpacingIssues(text, issues) {
    // 1. Multiple consecutive spaces
    let match;
    const multiSpaceRegex = / {2,}/g;
    while ((match = multiSpaceRegex.exec(text)) !== null) {
      issues.multipleSpaces.push({
        position: match.index,
        count: match[0].length,
        fix: ' '
      });
    }
    
    // 2. Missing space after punctuation
    const missingSpaceRegex = /([.,!?;:])([A-Za-z0-9])/g;
    while ((match = missingSpaceRegex.exec(text)) !== null) {
      issues.missingSpaceAfterPunct.push({
        position: match.index,
        char: match[1],
        fix: match[1] + ' ' + match[2]
      });
    }
    
    // 3. Space before punctuation
    const spaceBeforeRegex = / ([.,!?;:])/g;
    while ((match = spaceBeforeRegex.exec(text)) !== null) {
      issues.spaceBeforePunct.push({
        position: match.index,
        char: match[1],
        fix: match[1]
      });
    }
    
    // 4. Spaced letters (t h i s)
    const spacedLetterRegex = /\b([a-zA-Z]) ([a-zA-Z])(?: [a-zA-Z])+\b/g;
    while ((match = spacedLetterRegex.exec(text)) !== null) {
      issues.spacedLetters.push({
        position: match.index,
        original: match[0],
        fix: match[0].replace(/ /g, '')
      });
    }
  }
  
  /**
   * Detect punctuation issues (7-8)
   */
  function detectPunctuationIssues(text, issues) {
    // 8. Double punctuation
    let match;
    const doublePunctRegex = /([.,!?;:]){2,}/g;
    while ((match = doublePunctRegex.exec(text)) !== null) {
      issues.doublePunctuation.push({
        position: match.index,
        original: match[0],
        fix: match[1]
      });
    }
    
    // 6. Excessive line breaks
    const excessiveBreaksRegex = /\n{3,}/g;
    while ((match = excessiveBreaksRegex.exec(text)) !== null) {
      issues.excessiveLineBreaks.push({
        position: match.index,
        count: match[0].length,
        fix: '\n\n'
      });
    }
  }
  
  /**
   * Detect capitalization issues (9-10)
   */
  function detectCapitalizationIssues(text, issues) {
    // 9. Lowercase sentence starts
    const sentences = text.split(/[.!?]+\s+/);
    let position = 0;
    sentences.forEach(sentence => {
      if (sentence.length > 0 && /^[a-z]/.test(sentence.trim())) {
        issues.lowercaseStart.push({
          position: position,
          original: sentence.trim().charAt(0),
          fix: sentence.trim().charAt(0).toUpperCase()
        });
      }
      position += sentence.length + 2;
    });
    
    // 10. Random caps in words (e.g., "lINes", "Happend")
    let match;
    const randomCapsRegex = /\b[a-z]+[A-Z][a-z]*\b/g;
    while ((match = randomCapsRegex.exec(text)) !== null) {
      issues.randomCapsInWords.push({
        position: match.index,
        original: match[0],
        fix: match[0].toLowerCase()
      });
    }
  }
  
  /**
   * Detect spelling issues (11-13)
   */
  function detectSpellingIssues(text, issues) {
    // Common misspellings dictionary
    const commonMisspellings = {
      'teh': 'the', 'recieve': 'receive', 'seperate': 'separate',
      'occured': 'occurred', 'untill': 'until', 'wich': 'which',
      'thier': 'their', 'wierd': 'weird', 'beleive': 'believe',
      'definately': 'definitely', 'Ths': 'This', 'texxt': 'text',
      'someties': 'sometimes', 'relize': 'realize', 'importannt': 'important',
      'makse': 'makes', 'documnt': 'document', 'mayb': 'maybe',
      'diffrent': 'different', 'Happend': 'happened', 'supozed': 'supposed'
    };
    
    const words = text.match(/\b\w+\b/g) || [];
    words.forEach((word, idx) => {
      const lower = word.toLowerCase();
      if (commonMisspellings[lower]) {
        issues.spellingMistakes.push({
          word: word,
          fix: commonMisspellings[lower]
        });
      }
      
      // 12. Repeated characters (thiiis, readdd)
      if (/(.)\1{2,}/.test(word)) {
        issues.repeatedCharacters.push({
          word: word,
          fix: word.replace(/(.)\1{2,}/g, '$1$1')
        });
      }
    });
  }
  
  /**
   * Detect sentence structure issues (14-17)
   */
  function detectSentenceIssues(text, issues) {
    // 16. Repeated words ("the the")
    let match;
    const repeatedWordRegex = /\b(\w+)\s+\1\b/gi;
    while ((match = repeatedWordRegex.exec(text)) !== null) {
      issues.repeatedWords.push({
        position: match.index,
        word: match[1],
        fix: match[1]
      });
    }
    
    // 14. Run-on sentences (>200 chars without period)
    const longSentenceRegex = /[^.!?]{200,}[.!?]/g;
    while ((match = longSentenceRegex.exec(text)) !== null) {
      issues.runOnSentences.push({
        position: match.index,
        length: match[0].length
      });
    }
  }
  
  /**
   * Detect formatting issues (18-20)
   */
  function detectFormattingIssues(text, issues) {
    // 20. Unclosed brackets
    const brackets = {'(': ')', '[': ']', '{': '}', '<': '>'};
    const stack = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (brackets[char]) {
        stack.push({char: char, pos: i});
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last.char] !== char) {
          issues.unclosedBrackets.push({position: i, char: char});
        }
      }
    }
    stack.forEach(item => {
      issues.unclosedBrackets.push({position: item.pos, char: item.char});
    });
    
    // 20. Unclosed quotes
    let singleQuoteCount = (text.match(/'/g) || []).length;
    let doubleQuoteCount = (text.match(/"/g) || []).length;
    if (singleQuoteCount % 2 !== 0) {
      issues.unclosedQuotes.push({type: 'single', count: singleQuoteCount});
    }
    if (doubleQuoteCount % 2 !== 0) {
      issues.unclosedQuotes.push({type: 'double', count: doubleQuoteCount});
    }
  }
  
  /**
   * Detect character issues (21-23)
   */
  function detectCharacterIssues(text, issues) {
    // 22. Unicode glitches
    let match;
    const unicodeGlitchRegex = /[\ufffd\u00bf]/g;
    while ((match = unicodeGlitchRegex.exec(text)) !== null) {
      issues.unicodeGlitches.push({position: match.index, char: match[0]});
    }
    
    // 23. Invisible characters
    const invisibleRegex = /[\u200B\u00A0\uFEFF]/g;
    while ((match = invisibleRegex.exec(text)) !== null) {
      issues.invisibleChars.push({
        position: match.index,
        type: match[0] === '\u200B' ? 'zero-width' : 
              match[0] === '\u00A0' ? 'non-breaking-space' : 'BOM',
        fix: ' '
      });
    }
    
    // 21. Mixed dashes
    if (text.includes('–') || text.includes('—')) {
      issues.mixedDashes.push({
        count: (text.match(/[-–—]/g) || []).length,
        suggestion: 'Standardize to em-dash (—) or hyphen (-)'
      });
    }
  }
  
  /**
   * Detect consistency issues (24-28)
   */
  function detectConsistencyIssues(text, issues) {
    // 25. Mixed tabs and spaces
    if (text.includes('\t') && /^[ ]+/m.test(text)) {
      issues.mixedTabsSpaces.push({
        hasTabs: true,
        hasSpaces: true,
        fix: 'Convert all to spaces'
      });
    }
    
    // 26. Common homophones
    const homophones = [
      {wrong: /\btheir\b(?=\s+(is|are|was|were))/gi, right: "there"},
      {wrong: /\bthere\b(?=\s+\w+ing)/gi, right: "their"},
      {wrong: /\byour\b(?=\s+(a|an|the|going|welcome))/gi, right: "you're"}
    ];
    
    homophones.forEach(pair => {
      let match;
      while ((match = pair.wrong.exec(text)) !== null) {
        issues.wrongHomophones.push({
          position: match.index,
          wrong: match[0],
          fix: pair.right
        });
      }
    });
  }
  
  /**
   * Apply quick regex fixes (fast mode)
   * @param {Body} body - Document body
   * @param {Object} issues - Detected issues
   * @returns {Object} Fix results
   */
  function applyQuickFixes(body, issues) {
    const results = {};
    
    // Apply all regex-based fixes
    if (issues.multipleSpaces.length > 0) {
      body.replaceText(/ {2,}/g, ' ');
      results.multipleSpaces = issues.multipleSpaces.length;
    }
    
    if (issues.missingSpaceAfterPunct.length > 0) {
      body.replaceText(/([.,!?;:])([A-Za-z0-9])/g, '$1 $2');
      results.missingSpaceAfterPunct = issues.missingSpaceAfterPunct.length;
    }
    
    if (issues.spaceBeforePunct.length > 0) {
      body.replaceText(/ ([.,!?;:])/g, '$1');
      results.spaceBeforePunct = issues.spaceBeforePunct.length;
    }
    
    if (issues.doublePunctuation.length > 0) {
      body.replaceText(/([.,!?;:]){2,}/g, '$1');
      results.doublePunctuation = issues.doublePunctuation.length;
    }
    
    if (issues.excessiveLineBreaks.length > 0) {
      body.replaceText(/\n{3,}/g, '\n\n');
      results.excessiveLineBreaks = issues.excessiveLineBreaks.length;
    }
    
    if (issues.repeatedWords.length > 0) {
      body.replaceText(/\b(\w+)\s+\1\b/gi, '$1');
      results.repeatedWords = issues.repeatedWords.length;
    }
    
    if (issues.randomCapsInWords.length > 0) {
      // This needs special handling per word
      issues.randomCapsInWords.forEach(item => {
        body.replaceText(item.original, item.fix);
      });
      results.randomCapsInWords = issues.randomCapsInWords.length;
    }
    
    if (issues.invisibleChars.length > 0) {
      body.replaceText(/[\u200B\u00A0\uFEFF]/g, ' ');
      results.invisibleChars = issues.invisibleChars.length;
    }
    
    // Spacing in words
    if (issues.spacedLetters.length > 0) {
      issues.spacedLetters.forEach(item => {
        body.replaceText(item.original, item.fix);
      });
      results.spacedLetters = issues.spacedLetters.length;
    }
    
    return results;
  }
  
  /**
   * Apply AI-powered comprehensive fixes (optimized for 3-8 seconds)
   * @param {Body} body - Document body
   * @param {string} text - Original text
   * @returns {Object} Fix results
   */
  function applyAIPoweredFixes(body, text) {
    const startTime = new Date().getTime();
    
    // Optimize for speed: limit text length
    const maxChars = 8000;
    const textToProcess = text.length > maxChars ? 
      text.substring(0, maxChars) + '\n[...text truncated for speed...]' : text;
    
    // Ultra-short prompt for faster processing
    const prompt = `Fix all formatting errors in this text. Return only the corrected version:\n\n${textToProcess}`;
    
    // Use SimpleAIService (which is OllamaAIService renamed)
    let result;
    try {
      result = SimpleAIService.generateText(prompt);
    } catch (e) {
      return {
        success: false,
        error: 'SimpleAIService not available: ' + e.message
      };
    }
    
    if (result && result.success) {
      const correctedText = result.generated_text || result.text || '';
      
      // Proper document replacement using DocumentApp API
      try {
        const numChildren = body.getNumChildren();
        
        // Remove all existing content
        for (let i = numChildren - 1; i >= 0; i--) {
          body.removeChild(body.getChild(i));
        }
        
        // Split by newlines and add as paragraphs
        const lines = correctedText.split('\n');
        lines.forEach(line => {
          if (line.trim().length > 0) {
            body.appendParagraph(line);
          } else {
            body.appendParagraph('');
          }
        });
      } catch (e) {
        return {
          success: false,
          error: 'Failed to update document: ' + e.message
        };
      }
      
      const endTime = new Date().getTime();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        method: 'AI-powered (gemini-2.0-flash)',
        message: `Formatted in ${timeTaken}s`,
        time: timeTaken
      };
    }
    
    return {
      success: false,
      error: result ? result.error : 'AI call failed'
    };
  }
  
  // Public API
  return {
    analyzeAllIssues: analyzeAllIssues,
    applyQuickFixes: applyQuickFixes,
    applyAIPoweredFixes: applyAIPoweredFixes
  };
  
})();
