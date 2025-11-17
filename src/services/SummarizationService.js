/**
 * Summarization Service
 * Provides document summarization with local and optional backend processing
 */

const SummarizationService = (function() {
  
  const MAX_LOCAL_LENGTH = 5000; // characters
  const BACKEND_ENDPOINT = ''; // Configure if using Firebase/Cloud Functions
  
  /**
   * Summarizes the current document or selection
   * @param {boolean} selectionOnly - Summarize only selected text
   * @returns {Object} Summary result
   */
  function summarizeDocument(selectionOnly = false) {
    try {
      const docType = DocumentAnalysisEngine.getDocumentType();
      let text = '';
      
      // Extract text based on document type
      switch(docType) {
        case 'DOCUMENT':
          text = getDocumentText(selectionOnly);
          break;
        case 'SPREADSHEET':
          text = getSpreadsheetText(selectionOnly);
          break;
        case 'PRESENTATION':
          text = getPresentationText(selectionOnly);
          break;
        default:
          return { success: false, summary: 'Unsupported document type' };
      }
      
      if (!text || text.trim().length === 0) {
        return { success: false, summary: 'No text to summarize' };
      }
      
      // Priority 1: Try AI if configured
      const aiStatus = SimpleAIService.checkConnection();
      if (aiStatus.connected) {
        const result = SimpleAIService.summarizeText(text);
        if (result.success) return result;
      }
      
      // Priority 2: Use built-in local summarization
      if (text.length <= MAX_LOCAL_LENGTH) {
        const summary = summarizeLocally(text);
        return { success: true, summary, method: 'local' };
      } else {
        // For long documents without Gemini, truncate and summarize locally
        const truncated = text.substring(0, MAX_LOCAL_LENGTH);
        const summary = summarizeLocally(truncated);
        return {
          success: true,
          summary: summary + '\n\n[Note: Summary based on first ' + MAX_LOCAL_LENGTH + ' characters. Configure Gemini API for full document processing.]',
          method: 'local-truncated'
        };
      }
    } catch (e) {
      console.error('Error summarizing document:', e);
      return { success: false, summary: 'Error: ' + e.message };
    }
  }
  
  /**
   * Gets text from Google Doc
   * @param {boolean} selectionOnly - Get only selected text
   * @returns {string} Extracted text
   */
  function getDocumentText(selectionOnly) {
    const doc = DocumentApp.getActiveDocument();
    
    if (selectionOnly) {
      const selection = doc.getSelection();
      if (!selection) {
        return doc.getBody().getText();
      }
      
      const elements = selection.getRangeElements();
      return elements.map(element => {
        return element.getElement().asText().getText();
      }).join(' ');
    }
    
    return doc.getBody().getText();
  }
  
  /**
   * Gets text from Google Sheets
   * @param {boolean} selectionOnly - Get only selected range
   * @returns {string} Extracted text
   */
  function getSpreadsheetText(selectionOnly) {
    const sheet = SpreadsheetApp.getActiveSheet();
    let range;
    
    if (selectionOnly) {
      range = sheet.getActiveRange();
    } else {
      range = sheet.getDataRange();
    }
    
    const values = range.getValues();
    return values.map(row => row.join(' ')).join('\n');
  }
  
  /**
   * Gets text from Google Slides
   * @param {boolean} selectionOnly - Get only selected slide
   * @returns {string} Extracted text
   */
  function getPresentationText(selectionOnly) {
    const presentation = SlidesApp.getActivePresentation();
    let slides;
    
    if (selectionOnly) {
      const selection = presentation.getSelection();
      const currentPage = selection.getCurrentPage();
      slides = currentPage ? [currentPage] : presentation.getSlides();
    } else {
      slides = presentation.getSlides();
    }
    
    const text = [];
    
    slides.forEach(slide => {
      const shapes = slide.getShapes();
      shapes.forEach(shape => {
        if (shape.getText) {
          text.push(shape.getText().asString());
        }
      });
    });
    
    return text.join('\n\n');
  }
  
  /**
   * Summarizes text locally using extractive summarization
   * @param {string} text - Text to summarize
   * @returns {string} Summary
   */
  function summarizeLocally(text) {
    // Simple extractive summarization algorithm
    // This is a basic implementation - can be enhanced
    
    // Clean the text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    // Split into sentences
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return 'Unable to generate summary from provided text.';
    }
    
    // Score sentences based on keyword frequency
    const wordFreq = calculateWordFrequency(cleanText);
    const sentenceScores = sentences.map(sentence => ({
      sentence: sentence.trim(),
      score: scoreSentence(sentence, wordFreq)
    }));
    
    // Sort by score and take top sentences
    sentenceScores.sort((a, b) => b.score - a.score);
    
    const summaryLength = Math.min(5, Math.ceil(sentences.length * 0.3));
    const topSentences = sentenceScores.slice(0, summaryLength);
    
    // Reorder by original position for coherence
    const summary = topSentences
      .sort((a, b) => {
        const indexA = sentences.indexOf(a.sentence);
        const indexB = sentences.indexOf(b.sentence);
        return indexA - indexB;
      })
      .map(s => s.sentence)
      .join('. ');
    
    AnalyticsService.trackEvent('summarize', { method: 'local', length: text.length });
    
    return summary + '.';
  }
  
  /**
   * Calculates word frequency in text
   * @param {string} text - Input text
   * @returns {Object} Word frequency map
   */
  function calculateWordFrequency(text) {
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter out short words
    
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    return freq;
  }
  
  /**
   * Scores a sentence based on word frequency
   * @param {string} sentence - Sentence to score
   * @param {Object} wordFreq - Word frequency map
   * @returns {number} Score
   */
  function scoreSentence(sentence, wordFreq) {
    const words = sentence.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    if (words.length === 0) return 0;
    
    const totalScore = words.reduce((sum, word) => {
      return sum + (wordFreq[word] || 0);
    }, 0);
    
    return totalScore / words.length;
  }
  
  /**
   * Summarizes text using backend AI service
   * @param {string} text - Text to summarize
   * @returns {string} Summary
   */
  function summarizeWithBackend(text) {
    // This would integrate with Firebase/Cloud Functions or other backend
    // For now, providing a placeholder implementation
    
    if (!BACKEND_ENDPOINT) {
      // Fall back to local if no backend configured
      Logger.log('No backend endpoint configured, falling back to local summarization');
      return summarizeLocally(text.substring(0, MAX_LOCAL_LENGTH));
    }
    
    try {
      const payload = {
        text: text,
        maxLength: 200,
        user: Session.getActiveUser().getEmail()
      };
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(BACKEND_ENDPOINT + '/summarize', options);
      const result = JSON.parse(response.getContentText());
      
      if (result.success) {
        AnalyticsService.trackEvent('summarize', { method: 'backend', length: text.length });
        return result.summary;
      } else {
        throw new Error(result.error || 'Backend summarization failed');
      }
    } catch (e) {
      console.error('Backend summarization error:', e);
      // Fall back to local
      return summarizeLocally(text.substring(0, MAX_LOCAL_LENGTH));
    }
  }
  
  /**
   * Generates key points from text
   * @param {string} text - Text to analyze
   * @param {number} numPoints - Number of key points to extract
   * @returns {Array} Key points
   */
  function extractKeyPoints(text, numPoints = 5) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const wordFreq = calculateWordFrequency(text);
    
    const sentenceScores = sentences.map(sentence => ({
      sentence: sentence.trim(),
      score: scoreSentence(sentence, wordFreq)
    }));
    
    sentenceScores.sort((a, b) => b.score - a.score);
    
    return sentenceScores
      .slice(0, numPoints)
      .map(s => '• ' + s.sentence);
  }
  
  /**
   * Generates a title/heading from text
   * @param {string} text - Text to analyze
   * @returns {string} Generated title
   */
  function generateTitle(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return 'Untitled Document';
    }
    
    // Use first sentence as base for title
    const firstSentence = sentences[0].trim();
    const words = firstSentence.split(/\s+/).slice(0, 8); // First 8 words
    
    let title = words.join(' ');
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    return title;
  }
  
  /**
   * Counts words, sentences, and paragraphs in text
   * @param {string} text - Text to analyze
   * @returns {Object} Statistics
   */
  function getTextStatistics(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    const avgWordsPerSentence = sentences.length > 0 
      ? Math.round(words.length / sentences.length) 
      : 0;
    
    const avgSentencesPerParagraph = paragraphs.length > 0
      ? Math.round(sentences.length / paragraphs.length)
      : 0;
    
    return {
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      characters: text.length,
      avgWordsPerSentence,
      avgSentencesPerParagraph,
      readingTime: Math.ceil(words.length / 200) // ~200 words per minute
    };
  }
  
  // Public API
  return {
    summarizeDocument: summarizeDocument,
    extractKeyPoints: extractKeyPoints,
    generateTitle: generateTitle,
    getTextStatistics: getTextStatistics
  };
  
})();
