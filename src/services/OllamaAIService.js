/**
 * Simple AI Service using Google AI Studio
 * No tunneling, no servers, just works
 */

const SimpleAIService = (function() {
  
  /**
   * Get API key from user properties
   * @returns {string} API key
   */
  function getApiKey() {
    const props = PropertiesService.getUserProperties();
    return props.getProperty('AI_API_KEY') || '';
  }
  
  /**
   * Set API key
   * @param {string} apiKey - API key
   */
  function setApiKey(apiKey) {
    const props = PropertiesService.getUserProperties();
    props.setProperty('AI_API_KEY', apiKey);
  }
  
  /**
   * Check if configured
   * @returns {Object}
   */
  function checkConnection() {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        connected: false,
        error: 'API key not configured'
      };
    }
    
    // Test the key
    const result = callAI('Say "working"', { maxTokens: 10 });
    return {
      connected: result.success,
      error: result.success ? null : result.error,
      models: ['gemini-1.5-flash']
    };
  }
  
  /**
   * Call Google AI
   * @param {string} prompt
   * @param {Object} options
   * @returns {Object}
   */
  function callAI(prompt, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not configured' };
    }
    
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey;
      
      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };
      
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const result = JSON.parse(response.getContentText());
        const text = result.candidates[0].content.parts[0].text;
        return {
          success: true,
          text: text,
          model: 'gemini-1.5-flash'
        };
      } else {
        return {
          success: false,
          error: 'API Error: ' + response.getContentText()
        };
      }
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  }
  
  /**
   * Summarize text
   * @param {string} text
   * @param {Object} options
   * @returns {Object}
   */
  function summarizeText(text, options = {}) {
    const prompt = `Summarize this text concisely:\n\n${text}`;
    const result = callAI(prompt);
    
    if (result.success) {
      return {
        success: true,
        summary: result.text,
        method: 'google_ai',
        model: 'gemini-1.5-flash'
      };
    }
    return result;
  }
  
  /**
   * Fix grammar
   * @param {string} text
   * @returns {Object}
   */
  function fixGrammar(text) {
    const prompt = `Fix grammar and spelling. Return ONLY the corrected text:\n\n${text}`;
    const result = callAI(prompt);
    
    if (result.success) {
      return {
        success: true,
        corrected_text: result.text,
        original: text
      };
    }
    return result;
  }
  
  /**
   * Generate text
   * @param {string} prompt
   * @param {Object} options
   * @returns {Object}
   */
  function generateText(prompt, options = {}) {
    return callAI(prompt, options);
  }
  
  /**
   * Analyze document quality
   * @param {string} text
   * @returns {Object}
   */
  function analyzeDocumentQuality(text) {
    const prompt = `Analyze this document for quality issues. Be specific:\n\n${text}`;
    const result = callAI(prompt);
    
    if (result.success) {
      return {
        success: true,
        analysis: result.text,
        method: 'google_ai'
      };
    }
    return result;
  }
  
  // Alias names to match old interface
  return {
    getServerURL: () => 'Google AI Studio',
    setServerURL: () => {},
    getModel: () => 'gemini-1.5-flash',
    setModel: () => {},
    checkConnection: checkConnection,
    callOllama: callAI,
    summarizeText: summarizeText,
    fixGrammar: fixGrammar,
    generateText: generateText,
    analyzeDocumentQuality: analyzeDocumentQuality,
    // New simple names
    getApiKey: getApiKey,
    setApiKey: setApiKey
  };
  
})();
