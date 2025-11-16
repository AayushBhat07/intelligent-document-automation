/**
 * Sidebar Handlers
 * Functions called from the sidebar UI to execute operations
 */

/**
 * Analyzes the current document
 * Called from sidebar
 */
function analyzeDocument() {
  try {
    const results = DocumentAnalysisEngine.analyzeDocument();
    AnalyticsService.trackEvent('analyze_document', { 
      issueCount: results.issues.length 
    });
    return results;
  } catch (e) {
    console.error('Error in analyzeDocument:', e);
    return { issues: ['Error: ' + e.message], suggestions: [] };
  }
}

/**
 * Summarizes document content
 * Called from sidebar
 */
function summarizeDocument() {
  try {
    const result = SummarizationService.summarizeDocument(false);
    
    if (result.success) {
      AnalyticsService.trackEvent('summarize', { method: result.method });
      return result.summary;
    } else {
      return 'Unable to generate summary: ' + result.summary;
    }
  } catch (e) {
    console.error('Error in summarizeDocument:', e);
    return 'Error generating summary: ' + e.message;
  }
}

/**
 * Detects PII in the document
 * Called from sidebar
 */
function detectPIIInDocument() {
  try {
    const results = RedactionService.detectPIIInDocument();
    AnalyticsService.trackEvent('detect_pii', { count: results.total });
    return results;
  } catch (e) {
    console.error('Error in detectPIIInDocument:', e);
    return { found: [], total: 0, error: e.message };
  }
}

/**
 * Redacts PII in the document
 * Called from sidebar
 */
function redactPIIInDocument() {
  try {
    const results = RedactionService.redactPIIInDocument();
    
    if (results.success) {
      AnalyticsService.trackEvent('redact_pii', { count: results.count });
    }
    
    return results;
  } catch (e) {
    console.error('Error in redactPIIInDocument:', e);
    return { success: false, message: 'Error: ' + e.message, count: 0 };
  }
}

/**
 * Removes duplicate rows
 * Called from sidebar
 */
function removeDuplicateRows() {
  try {
    const results = AutomationRuleProcessor.removeDuplicateRows();
    return results;
  } catch (e) {
    console.error('Error in removeDuplicateRows:', e);
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Standardizes date formats
 * Called from sidebar
 */
function standardizeDateFormats() {
  try {
    const results = AutomationRuleProcessor.standardizeDateFormats();
    return results;
  } catch (e) {
    console.error('Error in standardizeDateFormats:', e);
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Fills empty cells intelligently
 * Called from sidebar
 */
function fillEmptyCellsIntelligently() {
  try {
    const results = AutomationRuleProcessor.fillEmptyCellsIntelligently();
    return results;
  } catch (e) {
    console.error('Error in fillEmptyCellsIntelligently:', e);
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Shows template picker
 * Called from sidebar
 */
function showTemplatePicker() {
  try {
    const results = TemplateManager.showTemplatePicker();
    return results;
  } catch (e) {
    console.error('Error in showTemplatePicker:', e);
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Applies a template
 * Called from sidebar
 * @param {string} templateId - Template ID to apply
 */
function applyTemplate(templateId) {
  try {
    const results = TemplateManager.applyTemplate(templateId);
    return results;
  } catch (e) {
    console.error('Error in applyTemplate:', e);
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Handles privacy consent toggle
 * Called from privacy settings
 * @param {Object} e - Event object
 */
function handlePrivacyToggle(e) {
  try {
    const formInputs = e.formInput;
    const advancedAI = formInputs.advancedAI === 'true';
    
    PrivacyGateController.updateConsent('advancedAI', advancedAI);
    
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Privacy settings updated'))
      .build();
  } catch (e) {
    console.error('Error handling privacy toggle:', e);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Error updating settings'))
      .build();
  }
}
