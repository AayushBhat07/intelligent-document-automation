/**
 * Automation Rule Processor
 * Executes macro-like operations for batch transformations and cleanup
 */

const AutomationRuleProcessor = (function() {
  
  /**
   * Removes duplicate rows from the active spreadsheet
   * @returns {Object} Result with count of removed duplicates
   */
  function removeDuplicateRows() {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length === 0) {
        return { success: false, message: 'No data to process', count: 0 };
      }
      
      const seen = new Map();
      const rowsToDelete = [];
      
      // Identify duplicates (skip header row if exists)
      values.forEach((row, index) => {
        const rowKey = JSON.stringify(row);
        if (seen.has(rowKey) && index > 0) {
          rowsToDelete.push(index + 1); // +1 for 1-based indexing
        } else {
          seen.set(rowKey, index + 1);
        }
      });
      
      // Delete duplicates in reverse order to maintain row numbers
      rowsToDelete.reverse().forEach(rowNum => {
        sheet.deleteRow(rowNum);
      });
      
      AnalyticsService.trackEvent('remove_duplicates', { count: rowsToDelete.length });
      
      return {
        success: true,
        message: `Removed ${rowsToDelete.length} duplicate row(s)`,
        count: rowsToDelete.length
      };
    } catch (e) {
      console.error('Error removing duplicates:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Standardizes date formats across the spreadsheet
   * @param {string} targetFormat - Desired date format (default: 'YYYY-MM-DD')
   * @returns {Object} Result with count of converted dates
   */
  function standardizeDateFormats(targetFormat = 'yyyy-MM-dd') {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let convertedCount = 0;
      
      values.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (isDateLike(cell)) {
            const dateObj = parseDate(cell);
            if (dateObj) {
              const cellRange = sheet.getRange(rowIndex + 1, colIndex + 1);
              cellRange.setValue(dateObj);
              cellRange.setNumberFormat(targetFormat);
              convertedCount++;
            }
          }
        });
      });
      
      AnalyticsService.trackEvent('standardize_dates', { count: convertedCount });
      
      return {
        success: true,
        message: `Standardized ${convertedCount} date(s) to ${targetFormat}`,
        count: convertedCount
      };
    } catch (e) {
      console.error('Error standardizing dates:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Fills empty cells intelligently based on surrounding data
   * @returns {Object} Result with count of filled cells
   */
  function fillEmptyCellsIntelligently() {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let filledCount = 0;
      
      values.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell === '' || cell === null || cell === undefined) {
            // Get column data to determine fill strategy
            const columnData = values.map(r => r[colIndex]).filter(c => c !== '' && c !== null && c !== undefined);
            
            if (columnData.length > 0) {
              const fillValue = determineFillValue(columnData, rowIndex, colIndex, values);
              if (fillValue !== null) {
                sheet.getRange(rowIndex + 1, colIndex + 1).setValue(fillValue);
                filledCount++;
              }
            }
          }
        });
      });
      
      AnalyticsService.trackEvent('fill_empty_cells', { count: filledCount });
      
      return {
        success: true,
        message: `Filled ${filledCount} empty cell(s)`,
        count: filledCount
      };
    } catch (e) {
      console.error('Error filling empty cells:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Removes empty rows from the spreadsheet
   * @returns {Object} Result with count of removed rows
   */
  function removeEmptyRows() {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      const rowsToDelete = [];
      
      values.forEach((row, index) => {
        if (row.every(cell => cell === '' || cell === null || cell === undefined)) {
          rowsToDelete.push(index + 1);
        }
      });
      
      // Delete in reverse order
      rowsToDelete.reverse().forEach(rowNum => {
        sheet.deleteRow(rowNum);
      });
      
      AnalyticsService.trackEvent('remove_empty_rows', { count: rowsToDelete.length });
      
      return {
        success: true,
        message: `Removed ${rowsToDelete.length} empty row(s)`,
        count: rowsToDelete.length
      };
    } catch (e) {
      console.error('Error removing empty rows:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Standardizes currency formats
   * @param {string} currencySymbol - Currency symbol to use (default: '$')
   * @returns {Object} Result with count of converted values
   */
  function standardizeCurrencyFormats(currencySymbol = '$') {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let convertedCount = 0;
      
      values.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (isCurrencyLike(cell)) {
            const numValue = parseCurrency(cell);
            if (numValue !== null) {
              const cellRange = sheet.getRange(rowIndex + 1, colIndex + 1);
              cellRange.setValue(numValue);
              cellRange.setNumberFormat(currencySymbol + '#,##0.00');
              convertedCount++;
            }
          }
        });
      });
      
      AnalyticsService.trackEvent('standardize_currency', { count: convertedCount });
      
      return {
        success: true,
        message: `Standardized ${convertedCount} currency value(s)`,
        count: convertedCount
      };
    } catch (e) {
      console.error('Error standardizing currency:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Trims whitespace from all text cells
   * @returns {Object} Result with count of trimmed cells
   */
  function trimWhitespace() {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let trimmedCount = 0;
      
      values.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (typeof cell === 'string' && cell !== cell.trim()) {
            sheet.getRange(rowIndex + 1, colIndex + 1).setValue(cell.trim());
            trimmedCount++;
          }
        });
      });
      
      AnalyticsService.trackEvent('trim_whitespace', { count: trimmedCount });
      
      return {
        success: true,
        message: `Trimmed whitespace from ${trimmedCount} cell(s)`,
        count: trimmedCount
      };
    } catch (e) {
      console.error('Error trimming whitespace:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  /**
   * Capitalizes text in selected format
   * @param {string} format - 'UPPER', 'lower', 'Title Case', 'Sentence case'
   * @returns {Object} Result with count of modified cells
   */
  function capitalizeText(format = 'Title Case') {
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const selection = sheet.getActiveRange();
      const values = selection.getValues();
      let modifiedCount = 0;
      
      values.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (typeof cell === 'string') {
            let newValue;
            switch(format) {
              case 'UPPER':
                newValue = cell.toUpperCase();
                break;
              case 'lower':
                newValue = cell.toLowerCase();
                break;
              case 'Title Case':
                newValue = toTitleCase(cell);
                break;
              case 'Sentence case':
                newValue = toSentenceCase(cell);
                break;
              default:
                newValue = cell;
            }
            
            if (newValue !== cell) {
              selection.getCell(rowIndex + 1, colIndex + 1).setValue(newValue);
              modifiedCount++;
            }
          }
        });
      });
      
      AnalyticsService.trackEvent('capitalize_text', { format, count: modifiedCount });
      
      return {
        success: true,
        message: `Applied ${format} to ${modifiedCount} cell(s)`,
        count: modifiedCount
      };
    } catch (e) {
      console.error('Error capitalizing text:', e);
      return { success: false, message: 'Error: ' + e.message, count: 0 };
    }
  }
  
  // Helper functions
  
  function isDateLike(value) {
    if (value instanceof Date) return true;
    if (typeof value !== 'string') return false;
    
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{2,4}$/,
      /^\d{1,2}\.\d{1,2}\.\d{2,4}$/
    ];
    
    return datePatterns.some(pattern => pattern.test(value));
  }
  
  function parseDate(value) {
    if (value instanceof Date) return value;
    
    try {
      // Try various date parsing strategies
      if (typeof value === 'string') {
        // MM/DD/YYYY or DD/MM/YYYY
        const parts = value.split(/[-\/\.]/);
        if (parts.length === 3) {
          const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
          const month = parseInt(parts[0]) - 1;
          const day = parseInt(parts[1]);
          return new Date(year, month, day);
        }
      }
      return new Date(value);
    } catch (e) {
      return null;
    }
  }
  
  function isCurrencyLike(value) {
    if (typeof value !== 'string') return false;
    return /^[$€£¥₹]?\s*[\d,]+\.?\d*$/.test(value.trim());
  }
  
  function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    
    try {
      const cleaned = value.replace(/[$€£¥₹,\s]/g, '');
      return parseFloat(cleaned);
    } catch (e) {
      return null;
    }
  }
  
  function determineFillValue(columnData, rowIndex, colIndex, allValues) {
    // Strategy 1: If mostly same value, use that
    const valueCounts = {};
    columnData.forEach(val => {
      valueCounts[val] = (valueCounts[val] || 0) + 1;
    });
    
    const mostCommon = Object.keys(valueCounts).reduce((a, b) => 
      valueCounts[a] > valueCounts[b] ? a : b
    );
    
    if (valueCounts[mostCommon] / columnData.length > 0.7) {
      return mostCommon;
    }
    
    // Strategy 2: Use value from row above if exists
    if (rowIndex > 0 && allValues[rowIndex - 1][colIndex]) {
      return allValues[rowIndex - 1][colIndex];
    }
    
    // Strategy 3: For numbers, use average
    const numbers = columnData.filter(v => typeof v === 'number');
    if (numbers.length > columnData.length * 0.5) {
      const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      return Math.round(avg * 100) / 100;
    }
    
    // Default: use most common value
    return mostCommon;
  }
  
  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
  
  function toSentenceCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // Public API
  return {
    removeDuplicateRows: removeDuplicateRows,
    standardizeDateFormats: standardizeDateFormats,
    fillEmptyCellsIntelligently: fillEmptyCellsIntelligently,
    removeEmptyRows: removeEmptyRows,
    standardizeCurrencyFormats: standardizeCurrencyFormats,
    trimWhitespace: trimWhitespace,
    capitalizeText: capitalizeText
  };
  
})();
