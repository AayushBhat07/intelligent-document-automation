/**
 * Local AI Service
 * Connects to locally-hosted AI models for document processing
 */

const LocalAIService = (function() {
  
  /**
   * Get the local AI server URL from user properties
   * @returns {string} Server URL
   */
  function getServerURL() {
    const props = PropertiesService.getUserProperties();
    // Default to ngrok URL format, user can customize
    return props.getProperty('LOCAL_AI_SERVER_URL') || '';
  }
  
  /**
   * Set the local AI server URL
   * @param {string} url - Server URL (e.g., https://abc123.ngrok-free.app)
   */
  function setServerURL(url) {
    const props = PropertiesService.getUserProperties();
    props.setProperty('LOCAL_AI_SERVER_URL', url);
  }
  
  /**
   * Check if local AI is configured and available
   * @returns {Object} Status object
   */
  function checkConnection() {
    const serverURL = getServerURL();
    
    if (!serverURL) {
      return {
        connected: false,
        error: 'No server URL configured. Please set up local AI server.'
      };
    }
    
    try {
      const response = UrlFetchApp.fetch(serverURL + '/health', {
        method: 'get',
        muteHttpExceptions: true,
        timeout: 5
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        return {
          connected: true,
          status: data.status,
          models_loaded: data.models_loaded
        };
      } else {
        return {
          connected: false,
          error: 'Server returned error: ' + response.getResponseCode()
        };
      }
    } catch (e) {
      return {
        connected: false,
        error: 'Cannot reach server: ' + e.message
      };
    }
  }
  
  /**
   * Summarize text using local AI
   * @param {string} text - Text to summarize
   * @param {Object} options - Summarization options
   * @returns {Object} Result object
   */
  function summarizeText(text, options = {}) {
    const serverURL = getServerURL();
    if (!serverURL) {
      return {
        success: false,
        error: 'Local AI server not configured'
      };
    }
    
    try {
      const payload = {
        text: text,
        max_length: options.maxLength || 150,
        min_length: options.minLength || 50
      };
      
      const response = UrlFetchApp.fetch(serverURL + '/api/summarize', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (result.success) {
        return {
          success: true,
          summary: result.summary,
          method: 'local_ai',
          model: 'BART-large-CNN'
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        };
      }
    } catch (e) {
      return {
        success: false,
        error: 'Failed to call local AI: ' + e.message
      };
    }
  }
  
  /**
   * Fix grammar and spelling using local AI
   * @param {string} text - Text to correct
   * @returns {Object} Result object
   */
  function fixGrammar(text) {
    const serverURL = getServerURL();
    if (!serverURL) {
      return {
        success: false,
        error: 'Local AI server not configured'
      };
    }
    
    try {
      const payload = { text: text };
      
      const response = UrlFetchApp.fetch(serverURL + '/api/fix-grammar', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (result.success) {
        return {
          success: true,
          corrected_text: result.corrected_text,
          original: result.original
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        };
      }
    } catch (e) {
      return {
        success: false,
        error: 'Failed to call local AI: ' + e.message
      };
    }
  }
  
  /**
   * Generate text based on prompt using local AI
   * @param {string} prompt - Generation prompt
   * @param {Object} options - Generation options
   * @returns {Object} Result object
   */
  function generateText(prompt, options = {}) {
    const serverURL = getServerURL();
    if (!serverURL) {
      return {
        success: false,
        error: 'Local AI server not configured'
      };
    }
    
    try {
      const payload = {
        prompt: prompt,
        max_length: options.maxLength || 200
      };
      
      const response = UrlFetchApp.fetch(serverURL + '/api/generate-text', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (result.success) {
        return {
          success: true,
          generated_text: result.generated_text
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        };
      }
    } catch (e) {
      return {
        success: false,
        error: 'Failed to call local AI: ' + e.message
      };
    }
  }
  
  /**
   * Comprehensive document analysis using local AI
   * @param {string} text - Document text
   * @param {Array} tasks - Tasks to perform
   * @returns {Object} Analysis results
   */
  function analyzeDocument(text, tasks = ['summarize']) {
    const serverURL = getServerURL();
    if (!serverURL) {
      return {
        success: false,
        error: 'Local AI server not configured'
      };
    }
    
    try {
      const payload = {
        text: text,
        tasks: tasks
      };
      
      const response = UrlFetchApp.fetch(serverURL + '/api/analyze-document', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      return result;
    } catch (e) {
      return {
        success: false,
        error: 'Failed to call local AI: ' + e.message
      };
    }
  }
  
  // Public API
  return {
    getServerURL: getServerURL,
    setServerURL: setServerURL,
    checkConnection: checkConnection,
    summarizeText: summarizeText,
    fixGrammar: fixGrammar,
    generateText: generateText,
    analyzeDocument: analyzeDocument
  };
  
})();
