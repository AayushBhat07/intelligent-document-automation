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
