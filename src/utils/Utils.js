/**
 * Utility Functions
 * Common helper functions used across the add-on
 */

const Utils = (function() {
  
  /**
   * Formats a date to a standard string
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  function formatDate(date, format = 'YYYY-MM-DD') {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
  
  /**
   * Debounces a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Chunks an array into smaller arrays
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} Array of chunks
   */
  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Creates a unique ID
   * @returns {string} Unique ID
   */
  function createUniqueId() {
    return Utilities.getUuid();
  }
  
  /**
   * Safely parses JSON
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed value or default
   */
  function safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('JSON parse error:', e);
      return defaultValue;
    }
  }
  
  /**
   * Retries a function with exponential backoff
   * @param {Function} func - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {*} Function result
   */
  function retryWithBackoff(func, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return func();
      } catch (e) {
        lastError = e;
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          Utilities.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Truncates text to a maximum length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
  
  /**
   * Escapes HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  /**
   * Validates email address
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  /**
   * Gets column letter from index
   * @param {number} index - Column index (0-based)
   * @returns {string} Column letter (A, B, C, ... Z, AA, AB, ...)
   */
  function getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }
  
  /**
   * Converts column letter to index
   * @param {string} letter - Column letter
   * @returns {number} Column index (0-based)
   */
  function getColumnIndex(letter) {
    let index = 0;
    for (let i = 0; i < letter.length; i++) {
      index = index * 26 + letter.charCodeAt(i) - 64;
    }
    return index - 1;
  }
  
  /**
   * Checks if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} Whether value is empty
   */
  function isEmpty(value) {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }
  
  /**
   * Deep clones an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Measures execution time of a function
   * @param {Function} func - Function to measure
   * @param {string} label - Label for logging
   * @returns {*} Function result
   */
  function measureTime(func, label = 'Operation') {
    const start = new Date().getTime();
    const result = func();
    const end = new Date().getTime();
    console.log(`${label} took ${end - start}ms`);
    return result;
  }
  
  /**
   * Batches operations to avoid quota limits
   * @param {Array} items - Items to process
   * @param {Function} operation - Operation to perform on each item
   * @param {number} batchSize - Batch size
   */
  function batchProcess(items, operation, batchSize = 100) {
    const chunks = chunkArray(items, batchSize);
    
    chunks.forEach((chunk, index) => {
      console.log(`Processing batch ${index + 1}/${chunks.length}`);
      chunk.forEach(item => operation(item));
      
      // Small delay between batches to avoid rate limits
      if (index < chunks.length - 1) {
        Utilities.sleep(100);
      }
    });
  }
  
  // Public API
  return {
    formatDate: formatDate,
    debounce: debounce,
    chunkArray: chunkArray,
    createUniqueId: createUniqueId,
    safeJsonParse: safeJsonParse,
    retryWithBackoff: retryWithBackoff,
    truncateText: truncateText,
    escapeHtml: escapeHtml,
    isValidEmail: isValidEmail,
    getColumnLetter: getColumnLetter,
    getColumnIndex: getColumnIndex,
    isEmpty: isEmpty,
    deepClone: deepClone,
    measureTime: measureTime,
    batchProcess: batchProcess
  };
  
})();
