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
    if (/\s{2,}/.test(text)) {
      issues.push('Found multiple consecutive spaces');
      suggestions.push('Remove extra spaces for cleaner formatting');
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
      SpreadsheetApp.getActiveSpreadsheet();
      return 'SPREADSHEET';
    } catch (e) {}
    
    try {
      DocumentApp.getActiveDocument();
      return 'DOCUMENT';
    } catch (e) {}
    
    try {
      SlidesApp.getActivePresentation();
      return 'PRESENTATION';
    } catch (e) {}
    
    return 'UNKNOWN';
  }
  
  // Public API
  return {
    analyzeDocument: analyzeDocument,
    getDocumentType: getDocumentType
  };
  
})();
