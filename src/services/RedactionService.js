/**
 * Redaction Service
 * Detects and redacts PII and sensitive information from documents
 */

const RedactionService = (function() {
  
  // PII patterns
  const PII_PATTERNS = {
    EMAIL: {
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      type: 'Email Address',
      redactWith: '[EMAIL REDACTED]'
    },
    PHONE: {
      regex: /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
      type: 'Phone Number',
      redactWith: '[PHONE REDACTED]'
    },
    SSN: {
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      type: 'Social Security Number',
      redactWith: '[SSN REDACTED]'
    },
    CREDIT_CARD: {
      regex: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
      type: 'Credit Card Number',
      redactWith: '[CARD REDACTED]'
    },
    IP_ADDRESS: {
      regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      type: 'IP Address',
      redactWith: '[IP REDACTED]'
    },
    DATE_OF_BIRTH: {
      regex: /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,
      type: 'Date of Birth',
      redactWith: '[DOB REDACTED]'
    },
    ZIP_CODE: {
      regex: /\b\d{5}(?:-\d{4})?\b/g,
      type: 'ZIP Code',
      redactWith: '[ZIP REDACTED]'
    }
  };
  
  /**
   * Detects PII in the current document
   * @returns {Object} Found PII items with type and preview
   */
  function detectPIIInDocument() {
    try {
      const docType = DocumentAnalysisEngine.getDocumentType();
      
      switch(docType) {
        case 'SPREADSHEET':
          return detectPIIInSpreadsheet();
        case 'DOCUMENT':
          return detectPIIInDoc();
        case 'PRESENTATION':
          return detectPIIInSlides();
        default:
          return { found: [], total: 0 };
      }
    } catch (e) {
      console.error('Error detecting PII:', e);
      return { found: [], total: 0, error: e.message };
    }
  }
  
  /**
   * Detects PII in a spreadsheet
   * @returns {Object} Found PII items
   */
  function detectPIIInSpreadsheet() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const found = [];
    
    values.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (typeof cell === 'string') {
          Object.keys(PII_PATTERNS).forEach(patternKey => {
            const pattern = PII_PATTERNS[patternKey];
            const matches = cell.match(pattern.regex);
            
            if (matches) {
              matches.forEach(match => {
                found.push({
                  type: pattern.type,
                  preview: maskPreview(match),
                  location: `Row ${rowIndex + 1}, Column ${colIndex + 1}`,
                  fullMatch: match,
                  row: rowIndex,
                  col: colIndex
                });
              });
            }
          });
        }
      });
    });
    
    return { found, total: found.length };
  }
  
  /**
   * Detects PII in a document
   * @returns {Object} Found PII items
   */
  function detectPIIInDoc() {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    const text = body.getText();
    const found = [];
    
    Object.keys(PII_PATTERNS).forEach(patternKey => {
      const pattern = PII_PATTERNS[patternKey];
      const matches = text.match(pattern.regex);
      
      if (matches) {
        matches.forEach(match => {
          found.push({
            type: pattern.type,
            preview: maskPreview(match),
            location: 'Document body',
            fullMatch: match
          });
        });
      }
    });
    
    return { found, total: found.length };
  }
  
  /**
   * Detects PII in slides
   * @returns {Object} Found PII items
   */
  function detectPIIInSlides() {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const found = [];
    
    slides.forEach((slide, slideIndex) => {
      const shapes = slide.getShapes();
      
      shapes.forEach(shape => {
        if (shape.getText) {
          const text = shape.getText().asString();
          
          Object.keys(PII_PATTERNS).forEach(patternKey => {
            const pattern = PII_PATTERNS[patternKey];
            const matches = text.match(pattern.regex);
            
            if (matches) {
              matches.forEach(match => {
                found.push({
                  type: pattern.type,
                  preview: maskPreview(match),
                  location: `Slide ${slideIndex + 1}`,
                  fullMatch: match,
                  slideIndex
                });
              });
            }
          });
        }
      });
    });
    
    return { found, total: found.length };
  }
  
  /**
   * Redacts detected PII from the document
   * @param {Array} piiItems - Optional array of specific PII items to redact
   * @returns {Object} Result with count of redacted items
   */
  function redactPIIInDocument(piiItems = null) {
    try {
      // Check privacy consent
      if (!PrivacyGateController.checkConsent('redaction')) {
        return {
          success: false,
          message: 'Privacy consent required for redaction',
          count: 0
        };
      }
      
      const docType = DocumentAnalysisEngine.getDocumentType();
      
      switch(docType) {
        case 'SPREADSHEET':
          return redactPIIInSpreadsheet(piiItems);
        case 'DOCUMENT':
          return redactPIIInDoc(piiItems);
        case 'PRESENTATION':
          return redactPIIInSlides(piiItems);
        default:
          return { success: false, message: 'Unsupported document type', count: 0 };
      }
    } catch (e) {
      console.error('Error redacting PII:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Redacts PII in spreadsheet
   * @param {Array} piiItems - Specific items to redact
   * @returns {Object} Result
   */
  function redactPIIInSpreadsheet(piiItems) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let redactedCount = 0;
    
    // If no specific items, detect all
    if (!piiItems) {
      const detected = detectPIIInSpreadsheet();
      piiItems = detected.found;
    }
    
    values.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (typeof cell === 'string') {
          let newValue = cell;
          
          Object.keys(PII_PATTERNS).forEach(patternKey => {
            const pattern = PII_PATTERNS[patternKey];
            if (pattern.regex.test(newValue)) {
              newValue = newValue.replace(pattern.regex, pattern.redactWith);
              redactedCount++;
            }
          });
          
          if (newValue !== cell) {
            sheet.getRange(rowIndex + 1, colIndex + 1).setValue(newValue);
          }
        }
      });
    });
    
    AnalyticsService.trackEvent('redact_pii', { count: redactedCount, docType: 'spreadsheet' });
    
    return {
      success: true,
      message: `Redacted ${redactedCount} sensitive item(s)`,
      count: redactedCount
    };
  }
  
  /**
   * Redacts PII in document
   * @param {Array} piiItems - Specific items to redact
   * @returns {Object} Result
   */
  function redactPIIInDoc(piiItems) {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    let redactedCount = 0;
    
    Object.keys(PII_PATTERNS).forEach(patternKey => {
      const pattern = PII_PATTERNS[patternKey];
      
      // Replace all matches in the body
      const searchResult = body.findText(pattern.regex.source);
      while (searchResult !== null) {
        const element = searchResult.getElement();
        const text = element.asText();
        const start = searchResult.getStartOffset();
        const end = searchResult.getEndOffsetInclusive();
        
        text.deleteText(start, end);
        text.insertText(start, pattern.redactWith);
        redactedCount++;
        
        // Continue search
        searchResult = body.findText(pattern.regex.source, searchResult);
      }
    });
    
    AnalyticsService.trackEvent('redact_pii', { count: redactedCount, docType: 'document' });
    
    return {
      success: true,
      message: `Redacted ${redactedCount} sensitive item(s)`,
      count: redactedCount
    };
  }
  
  /**
   * Redacts PII in slides
   * @param {Array} piiItems - Specific items to redact
   * @returns {Object} Result
   */
  function redactPIIInSlides(piiItems) {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    let redactedCount = 0;
    
    slides.forEach(slide => {
      const shapes = slide.getShapes();
      
      shapes.forEach(shape => {
        if (shape.getText) {
          const textRange = shape.getText();
          let text = textRange.asString();
          let modified = false;
          
          Object.keys(PII_PATTERNS).forEach(patternKey => {
            const pattern = PII_PATTERNS[patternKey];
            if (pattern.regex.test(text)) {
              text = text.replace(pattern.regex, pattern.redactWith);
              modified = true;
              redactedCount++;
            }
          });
          
          if (modified) {
            textRange.setText(text);
          }
        }
      });
    });
    
    AnalyticsService.trackEvent('redact_pii', { count: redactedCount, docType: 'presentation' });
    
    return {
      success: true,
      message: `Redacted ${redactedCount} sensitive item(s)`,
      count: redactedCount
    };
  }
  
  /**
   * Masks a value for preview display
   * @param {string} value - Value to mask
   * @returns {string} Masked preview
   */
  function maskPreview(value) {
    if (value.length <= 4) {
      return '***';
    }
    const visibleChars = 2;
    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    return `${start}${'*'.repeat(value.length - visibleChars * 2)}${end}`;
  }
  
  /**
   * Custom redaction for specific patterns
   * @param {string} customPattern - RegEx pattern to redact
   * @param {string} replacement - Replacement text
   * @returns {Object} Result
   */
  function customRedaction(customPattern, replacement = '[REDACTED]') {
    try {
      const docType = DocumentAnalysisEngine.getDocumentType();
      const regex = new RegExp(customPattern, 'g');
      let redactedCount = 0;
      
      if (docType === 'SPREADSHEET') {
        const sheet = SpreadsheetApp.getActiveSheet();
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        values.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (typeof cell === 'string' && regex.test(cell)) {
              const newValue = cell.replace(regex, replacement);
              sheet.getRange(rowIndex + 1, colIndex + 1).setValue(newValue);
              redactedCount++;
            }
          });
        });
      }
      
      AnalyticsService.trackEvent('custom_redaction', { count: redactedCount });
      
      return {
        success: true,
        message: `Applied custom redaction to ${redactedCount} item(s)`,
        count: redactedCount
      };
    } catch (e) {
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  // Public API
  return {
    detectPIIInDocument: detectPIIInDocument,
    redactPIIInDocument: redactPIIInDocument,
    customRedaction: customRedaction
  };
  
})();
