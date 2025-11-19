/**
 * Main entry point for the Intelligent Document Automation Add-on
 * Handles add-on installation and menu creation for Docs, Sheets, and Slides
 */

/**
 * Runs when the add-on is installed
 * @param {Object} e - The event parameter for install trigger
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Runs when a document is opened
 * Creates custom menu items for the add-on
 * @param {Object} e - The event parameter for open trigger
 */
function onOpen(e) {
  const ui = getHostAppUI();
  if (!ui) return;
  
  // Detect which app we're in and create appropriate menu
  const docType = DocumentAnalysisEngine.getDocumentType();
  
  if (docType === 'DOCUMENT') {
    createDocsMenu(ui);
  } else if (docType === 'SPREADSHEET') {
    createSheetsMenu(ui);
  } else if (docType === 'PRESENTATION') {
    createSlidesMenu(ui);
  } else {
    // Fallback to generic menu
    createGenericMenu(ui);
  }
}

/**
 * Creates menu specific to Google Docs
 */
function createDocsMenu(ui) {
  ui.createAddonMenu()
    .addItem('📋 Open Smart Automation', 'showSidebar')
    .addSeparator()
    .addSubMenu(ui.createMenu('📝 Document Tools')
      .addItem('🔍 Analyze Document', 'analyzeDocument')
      .addItem('⚡ Quick Fix (Fast)', 'quickFixFormatting')
      .addItem('⏪ Restore Version', 'restorePreviousVersion')
      .addItem('📊 Summarize', 'summarizeDocument'))
    .addSubMenu(ui.createMenu('🔒 Privacy & Redaction')
      .addItem('🔍 Detect PII', 'detectPIIInDocument')
      .addItem('🚫 Redact Sensitive Data', 'redactPIIInDocument'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🦙 Ollama AI')
      .addItem('⚙️ Configure Ollama', 'configureOllama')
      .addItem('🧪 Test Connection', 'testOllama')
      .addItem('📖 Setup Guide', 'showOllamaGuide'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Creates menu specific to Google Sheets
 */
function createSheetsMenu(ui) {
  ui.createAddonMenu()
    .addItem('📋 Open Smart Automation', 'showSidebar')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Data Cleanup')
      .addItem('🗑️ Remove Duplicates', 'removeDuplicateRows')
      .addItem('📅 Standardize Dates', 'standardizeDateFormats')
      .addItem('✨ Fill Empty Cells', 'fillEmptyCellsIntelligently'))
    .addSubMenu(ui.createMenu('🔍 Data Analysis')
      .addItem('📈 Analyze Sheet', 'analyzeDocument')
      .addItem('🔎 Find Anomalies', 'findDataAnomalies'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🦙 Ollama AI')
      .addItem('⚙️ Configure Ollama', 'configureOllama')
      .addItem('🧪 Test Connection', 'testOllama')
      .addItem('📖 Setup Guide', 'showOllamaGuide'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Creates menu specific to Google Slides
 */
function createSlidesMenu(ui) {
  ui.createAddonMenu()
    .addItem('📋 Open Smart Automation', 'showSidebar')
    .addSeparator()
    .addSubMenu(ui.createMenu('🎨 Presentation Tools')
      .addItem('🔍 Analyze Slides', 'analyzeDocument')
      .addItem('🎯 Check Consistency', 'checkSlideConsistency')
      .addItem('📝 Generate Speaker Notes', 'generateSpeakerNotes'))
    .addSubMenu(ui.createMenu('📋 Templates')
      .addItem('📁 Browse Templates', 'showTemplatePicker')
      .addItem('🎨 Apply Style', 'applyPresentationStyle'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🦙 Ollama AI')
      .addItem('⚙️ Configure Ollama', 'configureOllama')
      .addItem('🧪 Test Connection', 'testOllama')
      .addItem('📖 Setup Guide', 'showOllamaGuide'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Creates generic menu (fallback)
 */
function createGenericMenu(ui) {
  ui.createAddonMenu()
    .addItem('📋 Open Smart Automation', 'showSidebar')
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('📊 Usage Analytics', 'showAnalytics')
    .addItem('🔒 Privacy & Permissions', 'showPrivacySettings')
    .addSeparator()
    .addItem('❓ Help & Feedback', 'showHelp')
    .addToUi();
}

/**
 * Gets the UI object for the current host application
 * @returns {Ui|null} The UI object or null if not available
 */
function getHostAppUI() {
  try {
    // Try each host app in order
    if (typeof DocumentApp !== 'undefined') {
      return DocumentApp.getUi();
    } else if (typeof SpreadsheetApp !== 'undefined') {
      return SpreadsheetApp.getUi();
    } else if (typeof SlidesApp !== 'undefined') {
      return SlidesApp.getUi();
    }
  } catch (e) {
    console.error('Error getting UI:', e);
  }
  return null;
}

/**
 * Shows the main sidebar UI
 */
function showSidebar() {
  const ui = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('🤖 Smart Automation')
    .setWidth(320);
  
  const hostUI = getHostAppUI();
  if (hostUI) {
    hostUI.showSidebar(ui);
  }
}

/**
 * Show document summary in sidebar
 */
function summarizeDocument() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  try {
    const doc = DocumentApp.getActiveDocument();
    const text = doc.getBody().getText();
    
    if (!text || text.trim().length === 0) {
      ui.alert('No Content', 'Document is empty.', ui.ButtonSet.OK);
      return;
    }
    
    // Show sidebar with summary
    const html = HtmlService.createHtmlOutputFromFile('SummarySidebar')
      .setTitle('📊 Document Summary')
      .setWidth(350);
    
    ui.showSidebar(html);
    
  } catch (e) {
    ui.alert('Error', '❌ Could not summarize: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Get document summary for sidebar
 */
function getDocumentSummary() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const text = doc.getBody().getText();
    
    // Use SummarizationService
    const result = SummarizationService.summarizeText(text, {
      maxLength: 200,
      style: 'concise'
    });
    
    if (result && result.success) {
      return {
        success: true,
        summary: result.summary,
        method: result.method || 'local',
        wordCount: text.split(/\s+/).length,
        charCount: text.length
      };
    }
    
    // Fallback to basic summary
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    
    return {
      success: true,
      summary: text.substring(0, 300) + '...',
      method: 'excerpt',
      wordCount: words,
      charCount: text.length,
      sentenceCount: sentences
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Shows settings dialog
 */
function showSettings() {
  const card = buildSettingsCard();
  const nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

/**
 * Shows analytics dashboard
 */
function showAnalytics() {
  const card = buildAnalyticsCard();
  const nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

/**
 * Shows privacy settings
 */
function showPrivacySettings() {
  const card = buildPrivacyCard();
  const nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

/**
 * Shows help and feedback
 */
function showHelp() {
  const ui = getHostAppUI();
  if (ui) {
    ui.alert(
      'Help & Support',
      '📚 Documentation: Check the README.md file\n' +
      '🐛 Report Issues: GitHub Issues\n' +
      '💡 Feature Requests: Contact your admin\n\n' +
      '🔐 Privacy First: All processing happens locally unless you explicitly consent to advanced features.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Quick fix common formatting issues (Fast Mode - Regex)
 */
function quickFixFormatting() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const response = ui.alert(
    'Choose Formatting Mode',
    '⚡ QUICK MODE (Instant)\n' +
    'Uses regex patterns, fixes common issues fast\n\n' +
    '🤖 AI MODE (Comprehensive)\n' +
    'Uses AI to intelligently fix ALL 28 issue types\n' +
    'Slower but much more thorough\n\n' +
    'Choose Quick Mode?',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (response === ui.Button.CANCEL) {
    return;
  }
  
  const useAI = (response === ui.Button.NO);
  
  try {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    const text = body.getText();
    
    if (useAI) {
      // AI-Powered Mode
      applyAIFormattingMode(ui, body, text);
    } else {
      // Quick Regex Mode
      applyQuickFormattingMode(ui, body, text);
    }
    
  } catch (e) {
    ui.alert(
      'Error',
      '❌ Could not analyze formatting: ' + e.message,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Apply Quick Mode (regex-based)
 */
function applyQuickFormattingMode(ui, body, text) {
  // Analyze issues
  const issues = ComprehensiveFormatter.analyzeAllIssues(text, false);
  
  if (issues.totalCount === 0) {
    ui.alert(
      'No Issues Found',
      '✅ Your document formatting looks great!',
      ui.ButtonSet.OK
    );
    return;
  }
  
  // Show quick summary
  const summary = buildQuickIssueSummary(issues);
  const response = ui.alert(
    'Quick Mode - Fix ' + issues.totalCount + ' Issues?',
    summary + '\n\nApply fixes now?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  // Apply quick fixes
  const results = ComprehensiveFormatter.applyQuickFixes(body, issues);
  const totalFixed = Object.values(results).reduce((sum, val) => sum + (val || 0), 0);
  
  ui.alert(
    'Quick Fix Complete! ⚡',
    `✅ Fixed ${totalFixed} issues in < 1 second\n\n` +
    buildResultsSummary(results),
    ui.ButtonSet.OK
  );
}

/**
 * Apply AI Mode (comprehensive)
 */
function applyAIFormattingMode(ui, body, text) {
  // Check if AI is configured (check the actual service file)
  try {
    const testKey = typeof SimpleAIService !== 'undefined' && SimpleAIService.getApiKey();
    if (!testKey) {
      ui.alert(
        'AI Not Configured',
        '❌ Please configure AI first:\n' +
        'Extensions → Smart Automation → Ollama AI → Configure',
        ui.ButtonSet.OK
      );
      return;
    }
  } catch (e) {
    ui.alert(
      'AI Service Error',
      '❌ SimpleAIService not found. Make sure OllamaAIService.js is loaded.',
      ui.ButtonSet.OK
    );
    return;
  }
  
  const response = ui.alert(
    'AI Comprehensive Formatting',
    '🤖 AI will analyze and fix:\n\n' +
    '• All formatting issues\n' +
    '• Spelling & grammar\n' +
    '• Capitalization\n' +
    '• Punctuation\n\n' +
    '⏱️ Processing time: 3-8 seconds\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  // Apply AI fixes directly (no blocking alert)
  try {
    const result = applyOptimizedAIFixes(body, text);
    
    if (result.success) {
      let changesMsg = '';
      let debugInfo = '';
      
      if (result.changesMade) {
        changesMsg = '✅ Changes applied to document!';
      } else {
        changesMsg = '⚠️ No changes detected';
        debugInfo = `

DEBUG INFO:
Original: ${result.originalLength} chars
AI returned: ${result.newLength} chars

First 150 chars of AI output:
"${result.preview ? result.preview.substring(0, 150) : 'none'}..."`;
      }
      
      ui.alert(
        'AI Formatting Complete! 🎉',
        changesMsg + '\n\n' +
        `Processing time: ${result.time}s\n` +
        `💾 Version saved - use "Restore Version" to undo` +
        debugInfo,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'AI Formatting Failed',
        '❌ ' + result.error + '\n\n' +
        'Try Quick Mode instead.',
        ui.ButtonSet.OK
      );
    }
  } catch (e) {
    ui.alert(
      'Error',
      '❌ AI formatting failed: ' + e.message,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Apply optimized AI fixes (3-8 seconds)
 * @param {Body} body - Document body
 * @param {string} text - Original text  
 * @returns {Object} Result with timing
 */
function applyOptimizedAIFixes(body, text) {
  const startTime = new Date().getTime();
  
  // SAVE VERSION BEFORE CHANGES
  saveDocumentVersion(text);
  
  // Optimize: Limit text length for faster processing
  const maxChars = 8000;
  const textToFix = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
  
  // Optimized prompt - ENHANCED with specific formatting rules
  const prompt = `Fix ALL formatting errors in this text. Focus on:
- Mid-word spacing (fix: "t h i s" → "this")
- Mixed ellipsis (fix: "kinda…." → "kinda...")
- Capitalization after punctuation
- Double punctuation variations (fix: "!!??" → "!")
- Inconsistent punctuation emphasis (fix: "???" → "?")
- Lowercase sentence starts
- Run-on sentences (break if >200 chars)
- Grammar-formatting hybrid errors
- Incorrect punctuation endings

Return ONLY the corrected text:

${textToFix}`;
  
  // Call AI service directly
  const result = SimpleAIService.generateText(prompt);
  
  Logger.log('AI Result success: ' + (result ? result.success : 'null'));
  if (result && result.success) {
    const correctedText = result.generated_text || result.text;
    Logger.log('Corrected text exists: ' + (correctedText ? 'yes' : 'no'));
    Logger.log('Corrected text length: ' + (correctedText ? correctedText.length : 0));
    Logger.log('First 200 chars: ' + (correctedText ? correctedText.substring(0, 200) : 'none'));
    Logger.log('Last 100 chars: ' + (correctedText ? correctedText.substring(correctedText.length - 100) : 'none'));
    
    // Check for common AI response patterns that indicate it's not just returning the text
    if (correctedText && (correctedText.includes('Here is') || correctedText.includes('Here\'s') || correctedText.includes('Corrected text:'))) {
      Logger.log('WARNING: AI may have returned explanation instead of just corrected text');
    }
    
    if (!correctedText || correctedText.trim().length === 0) {
      Logger.log('ERROR: AI returned empty text');
      return {
        success: false,
        error: 'AI returned empty response'
      };
    }
    
    // APPLY CHANGES IMMEDIATELY (before success dialog)
    const changesMade = replaceDocumentText(body, correctedText);
    
    const endTime = new Date().getTime();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      time: timeTaken,
      changesMade: changesMade,
      preview: correctedText,
      originalLength: text.length,
      newLength: correctedText.length,
      message: 'Formatted using AI'
    };
  }
  
  return {
    success: false,
    error: result.error || 'AI service failed'
  };
}

/**
 * Replace document text properly using DocumentApp API
 * @param {Body} body - Document body
 * @param {string} newText - New text to insert
 * @returns {boolean} Whether changes were made
 */
function replaceDocumentText(body, newText) {
  if (!newText || newText.trim().length === 0) {
    Logger.log('replaceDocumentText: No text provided');
    return false;
  }
  
  try {
    // Get original text for comparison BEFORE changing anything
    const originalText = body.getText();
    
    // Log for debugging
    Logger.log('Original length: ' + originalText.length);
    Logger.log('New text length: ' + newText.length);
    Logger.log('First 100 chars of new text: ' + newText.substring(0, 100));
    
    // Check if text actually changed BEFORE modifying document
    // Normalize whitespace for comparison
    const normalizedOriginal = originalText.replace(/\s+/g, ' ').trim();
    const normalizedNew = newText.replace(/\s+/g, ' ').trim();
    const textChanged = normalizedOriginal !== normalizedNew;
    
    Logger.log('Text different from original: ' + textChanged);
    Logger.log('Normalized original length: ' + normalizedOriginal.length);
    Logger.log('Normalized new length: ' + normalizedNew.length);
    Logger.log('Original first 100: ' + originalText.substring(0, 100));
    Logger.log('New first 100: ' + newText.substring(0, 100));
    
    // Check character-by-character difference for first mismatch
    if (!textChanged) {
      Logger.log('Texts appear identical after normalization');
    } else {
      // Find first difference
      for (let i = 0; i < Math.min(normalizedOriginal.length, normalizedNew.length); i++) {
        if (normalizedOriginal[i] !== normalizedNew[i]) {
          Logger.log('First difference at position ' + i + ': "' + normalizedOriginal.substring(i, i+20) + '" vs "' + normalizedNew.substring(i, i+20) + '"');
          break;
        }
      }
    }
    
    // ALWAYS apply the changes (even if same, to ensure proper formatting)
    const numChildren = body.getNumChildren();
    
    // Remove all existing content
    for (let i = numChildren - 1; i >= 0; i--) {
      body.removeChild(body.getChild(i));
    }
    
    // Split by newlines and add as paragraphs
    const lines = newText.split('\n');
    let linesAdded = 0;
    
    lines.forEach(line => {
      if (line.trim().length > 0) {
        body.appendParagraph(line);
        linesAdded++;
      } else {
        body.appendParagraph(''); // Empty paragraph for spacing
      }
    });
    
    Logger.log('Lines added: ' + linesAdded);
    Logger.log('Document updated successfully');
    
    // CRITICAL: If we added lines, the document WAS modified
    // Return true if text differs OR if we successfully rebuilt the document
    const documentWasModified = linesAdded > 0;
    Logger.log('Document was modified: ' + documentWasModified);
    Logger.log('Content changed: ' + textChanged);
    
    // Return true if either the content changed OR we successfully updated the document
    return textChanged || documentWasModified;
  } catch (e) {
    Logger.log('Error replacing text: ' + e.message);
    Logger.log('Stack trace: ' + e.stack);
    return false;
  }
}

/**
 * Save document version for undo functionality
 * @param {string} text - Document text to save
 */
function saveDocumentVersion(text) {
  try {
    const userProps = PropertiesService.getUserProperties();
    const timestamp = new Date().getTime();
    
    // Keep last 5 versions
    const versions = [];
    for (let i = 1; i <= 4; i++) {
      const oldVersion = userProps.getProperty('DOC_VERSION_' + i);
      if (oldVersion) {
        versions.push(oldVersion);
      }
    }
    
    // Add new version at front
    const newVersion = JSON.stringify({
      timestamp: timestamp,
      text: text,
      date: new Date().toLocaleString()
    });
    
    versions.unshift(newVersion);
    
    // Save back (keep only 5 most recent)
    for (let i = 0; i < Math.min(5, versions.length); i++) {
      userProps.setProperty('DOC_VERSION_' + (i + 1), versions[i]);
    }
    
    Logger.log('Version saved: ' + new Date().toLocaleString());
  } catch (e) {
    Logger.log('Error saving version: ' + e.message);
  }
}

/**
 * Restore previous document version with full content preview
 */
function restorePreviousVersion() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  try {
    const userProps = PropertiesService.getUserProperties();
    const versions = [];
    
    // Get all saved versions
    for (let i = 1; i <= 5; i++) {
      const versionData = userProps.getProperty('DOC_VERSION_' + i);
      if (versionData) {
        try {
          versions.push(JSON.parse(versionData));
        } catch (e) {
          Logger.log('Error parsing version ' + i + ': ' + e.message);
        }
      }
    }
    
    if (versions.length === 0) {
      ui.alert(
        'No Versions Available',
        '❌ No previous versions found.\n\nVersions are saved automatically before each AI format operation.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Show version selection with content preview
    showVersionPreviewDialog(versions);
    
  } catch (e) {
    ui.alert(
      'Error',
      '❌ Could not load versions: ' + e.message,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Show version preview dialog with HTML
 */
function showVersionPreviewDialog(versions) {
  // Store versions temporarily for HTML access
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('TEMP_VERSIONS', JSON.stringify(versions));
  
  const html = HtmlService.createHtmlOutputFromFile('VersionPreview')
    .setWidth(700)
    .setHeight(600);
  
  const ui = getHostAppUI();
  if (ui) {
    ui.showModalDialog(html, '⏪ Restore Previous Version');
  }
}

/**
 * Get versions for preview HTML
 */
function getVersionsForPreview() {
  const userProps = PropertiesService.getUserProperties();
  const versionsJson = userProps.getProperty('TEMP_VERSIONS');
  return versionsJson ? JSON.parse(versionsJson) : [];
}

/**
 * Restore specific version by index
 */
function restoreVersionByIndex(index) {
  try {
    const userProps = PropertiesService.getUserProperties();
    const versionsJson = userProps.getProperty('TEMP_VERSIONS');
    const versions = versionsJson ? JSON.parse(versionsJson) : [];
    
    if (index >= 0 && index < versions.length) {
      const doc = DocumentApp.getActiveDocument();
      const body = doc.getBody();
      const selectedVersion = versions[index];
      
      // Restore the version
      replaceDocumentText(body, selectedVersion.text);
      
      // Clean up temp data
      userProps.deleteProperty('TEMP_VERSIONS');
      
      return {
        success: true,
        message: 'Version from ' + selectedVersion.date + ' restored!'
      };
    }
    
    return {
      success: false,
      message: 'Invalid version index'
    };
  } catch (e) {
    return {
      success: false,
      message: 'Error: ' + e.message
    };
  }
}

/**
 * Build quick issue summary
 */
function buildQuickIssueSummary(issues) {
  let summary = '🔍 Found:\n';
  
  if (issues.multipleSpaces.length > 0) {
    summary += `• ${issues.multipleSpaces.length} multiple spaces\n`;
  }
  if (issues.missingSpaceAfterPunct.length > 0) {
    summary += `• ${issues.missingSpaceAfterPunct.length} missing spaces after punctuation\n`;
  }
  if (issues.spaceBeforePunct.length > 0) {
    summary += `• ${issues.spaceBeforePunct.length} spaces before punctuation\n`;
  }
  if (issues.doublePunctuation.length > 0) {
    summary += `• ${issues.doublePunctuation.length} double punctuation\n`;
  }
  if (issues.repeatedWords.length > 0) {
    summary += `• ${issues.repeatedWords.length} repeated words\n`;
  }
  if (issues.spacedLetters.length > 0) {
    summary += `• ${issues.spacedLetters.length} spaced-out words\n`;
  }
  if (issues.randomCapsInWords.length > 0) {
    summary += `• ${issues.randomCapsInWords.length} random capitals\n`;
  }
  if (issues.invisibleChars.length > 0) {
    summary += `• ${issues.invisibleChars.length} invisible characters\n`;
  }
  
  return summary;
}

/**
 * Build results summary
 */
function buildResultsSummary(results) {
  let summary = '';
  Object.keys(results).forEach(key => {
    if (results[key] > 0) {
      summary += `• ${results[key]} ${formatKeyName(key)}\n`;
    }
  });
  return summary;
}

/**
 * Format key name for display
 */
function formatKeyName(key) {
  return key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
}

/**
 * Get formatting preview data for HTML modal
 * Called from FormattingPreview.html
 * @returns {Object} Issues data with examples
 */
function getFormattingPreviewData() {
  const userProps = PropertiesService.getUserProperties();
  const text = userProps.getProperty('FORMATTING_PREVIEW_TEXT');
  
  if (!text) {
    return { totalCount: 0, examples: [] };
  }
  
  return analyzeFormattingIssues(text);
}

/**
 * Apply formatting fixes after user confirms from preview modal
 * Called from FormattingPreview.html
 */
function applyFormattingFixesFromPreview() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  try {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    const userProps = PropertiesService.getUserProperties();
    const text = userProps.getProperty('FORMATTING_PREVIEW_TEXT');
    
    if (!text) {
      ui.alert('Error', 'Preview data not found.', ui.ButtonSet.OK);
      return;
    }
    
    // Apply fixes
    const fixResults = applyFormattingFixes(body, text);
    
    // Clean up stored data
    userProps.deleteProperty('FORMATTING_PREVIEW_TEXT');
    
    // Show results
    ui.alert(
      'Formatting Fixed! ✨',
      buildFixResultsMessage(fixResults),
      ui.ButtonSet.OK
    );
    
  } catch (e) {
    ui.alert(
      'Error',
      '❌ Could not apply fixes: ' + e.message,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Analyze formatting issues without modifying the document
 * @param {string} text - Document text
 * @returns {Object} Issue counts by type with examples
 */
function analyzeFormattingIssues(text) {
  const issues = {
    multipleSpaces: 0,
    spaceBeforePunct: 0,
    missingSpaceAfterPunct: 0,
    extraLineBreaks: 0,
    repeatedPunctuation: 0,
    spacedLetters: 0,
    totalCount: 0,
    examples: [] // Visual diff examples
  };
  
  // Count and collect multiple spaces (2 or more)
  const multiSpaceMatches = text.match(/ {2,}/g);
  if (multiSpaceMatches) {
    issues.multipleSpaces = multiSpaceMatches.length;
    // Get first few examples with context
    const exampleRegex = /(\S{0,15}) {2,}(\S{0,15})/g;
    let match;
    let exampleCount = 0;
    while ((match = exampleRegex.exec(text)) !== null && exampleCount < 3) {
      const before = match[1];
      const after = match[2];
      const spaces = match[0].match(/ +/)[0];
      issues.examples.push({
        type: 'Multiple spaces',
        before: `${before}${spaces}${after}`,
        after: `${before} ${after}`,
        change: `"${spaces}" → " "`
      });
      exampleCount++;
    }
  }
  
  // Count and collect space before punctuation
  const spacePunctRegex = /(\S{0,15}) ([.,!?;:])(\S{0,10})/g;
  let match;
  let count = 0;
  while ((match = spacePunctRegex.exec(text)) !== null && count < 3) {
    issues.spaceBeforePunct++;
    if (count < 3) {
      issues.examples.push({
        type: 'Space before punctuation',
        before: `${match[1]} ${match[2]}${match[3]}`,
        after: `${match[1]}${match[2]}${match[3]}`,
        change: `" ${match[2]}" → "${match[2]}"`
      });
    }
    count++;
  }
  
  // Count and collect missing space after punctuation
  const missingSpaceRegex = /(\S{0,15})([.,!?;:])([A-Za-z0-9]\S{0,10})/g;
  count = 0;
  while ((match = missingSpaceRegex.exec(text)) !== null && count < 3) {
    issues.missingSpaceAfterPunct++;
    if (count < 3) {
      issues.examples.push({
        type: 'Missing space after punctuation',
        before: `${match[1]}${match[2]}${match[3]}`,
        after: `${match[1]}${match[2]} ${match[3]}`,
        change: `"${match[2]}${match[3].charAt(0)}" → "${match[2]} ${match[3].charAt(0)}"`
      });
    }
    count++;
  }
  
  // Count and collect extra line breaks (3 or more)
  const multiLineRegex = /(\S{0,20})\n{3,}(\S{0,20})/g;
  count = 0;
  while ((match = multiLineRegex.exec(text)) !== null && count < 2) {
    issues.extraLineBreaks++;
    if (count < 2) {
      const lineBreaks = match[0].match(/\n+/)[0];
      issues.examples.push({
        type: 'Extra line breaks',
        before: `${match[1]}${lineBreaks}${match[2]}`,
        after: `${match[1]}\n\n${match[2]}`,
        change: `${lineBreaks.length} blank lines → 2 blank lines`
      });
    }
    count++;
  }
  
  // Count and collect repeated punctuation (e.g., ???, !!!, ,,,)
  const repeatedPunctRegex = /(\S{0,15})([.,!?;:]){3,}(\S{0,10})/g;
  count = 0;
  while ((match = repeatedPunctRegex.exec(text)) !== null && count < 3) {
    issues.repeatedPunctuation++;
    if (count < 3) {
      const repeated = match[0].match(/[.,!?;:]+/)[0];
      const single = match[2];
      issues.examples.push({
        type: 'Repeated punctuation',
        before: `${match[1]}${repeated}${match[3]}`,
        after: `${match[1]}${single}${match[3]}`,
        change: `"${repeated}" → "${single}"`
      });
    }
    count++;
  }
  
  // Count and collect spaced-out letters (e.g., "t h i s")
  const spacedLettersRegex = /(\S{0,10})\b([a-zA-Z]) ([a-zA-Z]) ([a-zA-Z])( [a-zA-Z])*\b(\S{0,10})/g;
  count = 0;
  while ((match = spacedLettersRegex.exec(text)) !== null && count < 2) {
    issues.spacedLetters++;
    if (count < 2) {
      const spacedWord = match[0].match(/\b([a-zA-Z] )+[a-zA-Z]\b/)[0];
      const fixed = spacedWord.replace(/ /g, '');
      issues.examples.push({
        type: 'Spaced-out letters',
        before: spacedWord,
        after: fixed,
        change: `"${spacedWord}" → "${fixed}"`
      });
    }
    count++;
  }
  
  issues.totalCount = issues.multipleSpaces + issues.spaceBeforePunct + 
                      issues.missingSpaceAfterPunct + issues.extraLineBreaks +
                      issues.repeatedPunctuation + issues.spacedLetters;
  
  return issues;
}

/**
 * Build visual diff preview message showing actual text changes
 * @param {Object} issues - Issue counts with examples
 * @returns {string} Preview message with diff-style changes
 */
function buildFormattingPreview(issues) {
  if (issues.totalCount === 0) {
    return 'No formatting issues found!';
  }
  
  let message = `🔍 PREVIEW: ${issues.totalCount} formatting change${issues.totalCount === 1 ? '' : 's'}\n`;
  message += '='.repeat(40) + '\n\n';
  
  // Group examples by type
  const grouped = {};
  issues.examples.forEach(ex => {
    if (!grouped[ex.type]) grouped[ex.type] = [];
    grouped[ex.type].push(ex);
  });
  
  // Display each type with visual diffs
  Object.keys(grouped).forEach(type => {
    const examples = grouped[type];
    message += `📝 ${type}\n`;
    message += '-'.repeat(40) + '\n';
    
    examples.forEach((ex, idx) => {
      message += `${idx + 1}. BEFORE: "${truncateText(ex.before, 35)}"\n`;
      message += `   AFTER:  "${truncateText(ex.after, 35)}"\n`;
      message += `   Change: ${ex.change}\n\n`;
    });
  });
  
  // Add summary
  message += '='.repeat(40) + '\n';
  message += '📊 SUMMARY:\n';
  if (issues.multipleSpaces > 0) {
    message += `  • ${issues.multipleSpaces} multiple space${issues.multipleSpaces === 1 ? '' : 's'}\n`;
  }
  if (issues.spaceBeforePunct > 0) {
    message += `  • ${issues.spaceBeforePunct} space${issues.spaceBeforePunct === 1 ? '' : 's'} before punctuation\n`;
  }
  if (issues.missingSpaceAfterPunct > 0) {
    message += `  • ${issues.missingSpaceAfterPunct} missing space${issues.missingSpaceAfterPunct === 1 ? '' : 's'} after punctuation\n`;
  }
  if (issues.extraLineBreaks > 0) {
    message += `  • ${issues.extraLineBreaks} extra line break${issues.extraLineBreaks === 1 ? '' : 's'}\n`;
  }
  
  message += `\n✨ Apply all ${issues.totalCount} fix${issues.totalCount === 1 ? '' : 'es'}?`;
  
  return message;
}

/**
 * Truncate text for display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  // Replace newlines with visible symbol
  text = text.replace(/\n/g, '↵');
  
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Apply formatting fixes to the document (optimized)
 * @param {Body} body - Document body
 * @param {string} text - Original text for validation
 * @returns {Object} Results of fixes applied
 */
function applyFormattingFixes(body, text) {
  const results = {
    multipleSpaces: 0,
    spaceBeforePunct: 0,
    missingSpaceAfterPunct: 0,
    extraLineBreaks: 0,
    repeatedPunctuation: 0,
    spacedLetters: 0,
    totalFixed: 0
  };
  
  // Fix 1: Multiple spaces → single space (GLOBAL)
  const multiSpaceRegex = / {2,}/g;
  const multiSpaceMatches = text.match(multiSpaceRegex);
  if (multiSpaceMatches) {
    body.replaceText(multiSpaceRegex, ' ');
    results.multipleSpaces = multiSpaceMatches.length;
  }
  
  // Fix 2: Space before punctuation (GLOBAL)
  const spacePunctRegex = / ([.,!?;:])/g;
  const spacePunctMatches = text.match(spacePunctRegex);
  if (spacePunctMatches) {
    body.replaceText(spacePunctRegex, '$1');
    results.spaceBeforePunct = spacePunctMatches.length;
  }
  
  // Fix 3: Missing space after punctuation (GLOBAL) - any letter or number
  const missingSpaceRegex = /([.,!?;:])([A-Za-z0-9])/g;
  const missingSpaceMatches = text.match(missingSpaceRegex);
  if (missingSpaceMatches) {
    body.replaceText(missingSpaceRegex, '$1 $2');
    results.missingSpaceAfterPunct = missingSpaceMatches.length;
  }
  
  // Fix 4: Extra line breaks (GLOBAL)
  const multiLineRegex = /\n{3,}/g;
  const multiLineMatches = text.match(multiLineRegex);
  if (multiLineMatches) {
    body.replaceText(multiLineRegex, '\n\n');
    results.extraLineBreaks = multiLineMatches.length;
  }
  
  // Fix 5: Repeated punctuation (???, !!!, ,,,) → single
  const repeatedPunctRegex = /([.,!?;:]){3,}/g;
  const repeatedPunctMatches = text.match(repeatedPunctRegex);
  if (repeatedPunctMatches) {
    // Keep just one of the repeated punctuation
    body.replaceText(repeatedPunctRegex, '$1');
    results.repeatedPunctuation = repeatedPunctMatches.length;
  }
  
  // Fix 6: Spaced-out letters (t h i s) → this
  const spacedLettersRegex = /\b([a-zA-Z]) ([a-zA-Z]) ([a-zA-Z])( [a-zA-Z])*\b/g;
  const spacedLettersMatches = text.match(spacedLettersRegex);
  if (spacedLettersMatches) {
    // This requires special handling - remove spaces between single letters
    spacedLettersMatches.forEach(match => {
      const fixed = match.replace(/ /g, '');
      body.replaceText(match, fixed);
    });
    results.spacedLetters = spacedLettersMatches.length;
  }
  
  results.totalFixed = results.multipleSpaces + results.spaceBeforePunct + 
                       results.missingSpaceAfterPunct + results.extraLineBreaks +
                       results.repeatedPunctuation + results.spacedLetters;
  
  return results;
}

/**
 * Build results message showing what was fixed
 * @param {Object} results - Fix results
 * @returns {string} Results message
 */
function buildFixResultsMessage(results) {
  let message = `Successfully fixed ${results.totalFixed} issue${results.totalFixed === 1 ? '' : 's'}!\n\n`;
  
  if (results.multipleSpaces > 0) {
    message += `✅ Fixed ${results.multipleSpaces} multiple space issue${results.multipleSpaces === 1 ? '' : 's'}\n`;
  }
  if (results.spaceBeforePunct > 0) {
    message += `✅ Removed ${results.spaceBeforePunct} space${results.spaceBeforePunct === 1 ? '' : 's'} before punctuation\n`;
  }
  if (results.missingSpaceAfterPunct > 0) {
    message += `✅ Added ${results.missingSpaceAfterPunct} space${results.missingSpaceAfterPunct === 1 ? '' : 's'} after punctuation\n`;
  }
  if (results.extraLineBreaks > 0) {
    message += `✅ Normalized ${results.extraLineBreaks} extra line break${results.extraLineBreaks === 1 ? '' : 's'}\n`;
  }
  if (results.repeatedPunctuation > 0) {
    message += `✅ Fixed ${results.repeatedPunctuation} repeated punctuation issue${results.repeatedPunctuation === 1 ? '' : 's'}\n`;
  }
  if (results.spacedLetters > 0) {
    message += `✅ Joined ${results.spacedLetters} spaced-out word${results.spacedLetters === 1 ? '' : 's'}\n`;
  }
  
  message += '\n🎉 Your document is now properly formatted!';
  
  return message;
}

/**
 * Homepage trigger for Docs
 */
function onDocsHomepage(e) {
  return buildHomepageCard('Docs');
}

/**
 * Homepage trigger for Sheets
 */
function onSheetsHomepage(e) {
  return buildHomepageCard('Sheets');
}

/**
 * Homepage trigger for Slides
 */
function onSlidesHomepage(e) {
  return buildHomepageCard('Slides');
}

/**
 * Builds the homepage card
 */
function buildHomepageCard(appType) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('🤖 Smart Document Automation')
      .setSubtitle('Automate repetitive tasks with ease'))
    .addSection(CardService.newCardSection()
      .setHeader('Quick Actions')
      .addWidget(CardService.newTextParagraph()
        .setText('Open a document to get started with smart automation!')))
    .build();
}

/**
 * Builds settings card
 */
function buildSettingsCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('⚙️ Settings'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('Configure your automation preferences')))
    .build();
}

/**
 * Builds analytics card
 */
function buildAnalyticsCard() {
  const stats = AnalyticsService.getUsageStats();
  
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('📊 Usage Analytics'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newKeyValue()
        .setTopLabel('Total Actions')
        .setContent(String(stats.totalActions || 0)))
      .addWidget(CardService.newKeyValue()
        .setTopLabel('Time Saved (est.)')
        .setContent(stats.timeSaved || '0 min')))
    .build();
}

/**
 * Builds privacy settings card
 */
function buildPrivacyCard() {
  const consent = PrivacyGateController.getConsent();
  
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('🔒 Privacy & Permissions'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('✅ All data processing happens locally by default\n\n' +
                 '🔐 Advanced features require explicit consent\n\n' +
                 '🚫 No data is shared with third parties'))
      .addWidget(CardService.newDecoratedText()
        .setText('Advanced AI Processing')
        .setSwitchControl(CardService.newSwitch()
          .setFieldName('advancedAI')
          .setValue(consent.advancedAI || false)
          .setOnChangeAction(CardService.newAction()
            .setFunctionName('handlePrivacyToggle')))))
    .build();
}
