/**
 * Privacy Gate Controller
 * Manages user consent and enforces privacy policies for data processing
 */

const PrivacyGateController = (function() {
  
  const CONSENT_PROPERTY_KEY = 'privacyConsent';
  const CONSENT_TYPES = {
    BASIC: 'basic',
    ADVANCED_AI: 'advancedAI',
    REDACTION: 'redaction',
    ANALYTICS: 'analytics',
    TEMPLATE_SHARING: 'templateSharing'
  };
  
  /**
   * Gets current consent settings
   * @returns {Object} Consent settings for all types
   */
  function getConsent() {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const consentJson = userProperties.getProperty(CONSENT_PROPERTY_KEY);
      
      if (consentJson) {
        return JSON.parse(consentJson);
      }
      
      // Default consent settings - only basic features enabled
      return {
        basic: true,
        advancedAI: false,
        redaction: true,
        analytics: false,
        templateSharing: false,
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('Error getting consent:', e);
      return getDefaultConsent();
    }
  }
  
  /**
   * Updates consent for a specific type
   * @param {string} consentType - Type of consent to update
   * @param {boolean} granted - Whether consent is granted
   * @returns {Object} Updated consent settings
   */
  function updateConsent(consentType, granted) {
    try {
      const currentConsent = getConsent();
      currentConsent[consentType] = granted;
      currentConsent.timestamp = new Date().toISOString();
      
      const userProperties = PropertiesService.getUserProperties();
      userProperties.setProperty(CONSENT_PROPERTY_KEY, JSON.stringify(currentConsent));
      
      // Log consent change
      logPrivacyEvent('consent_update', {
        type: consentType,
        granted: granted
      });
      
      return currentConsent;
    } catch (e) {
      console.error('Error updating consent:', e);
      return getConsent();
    }
  }
  
  /**
   * Checks if consent is granted for a specific operation
   * @param {string} consentType - Type of consent to check
   * @returns {boolean} Whether consent is granted
   */
  function checkConsent(consentType) {
    const consent = getConsent();
    return consent[consentType] === true;
  }
  
  /**
   * Requests consent from user for a specific operation
   * @param {string} consentType - Type of consent to request
   * @param {string} reason - Reason for requesting consent
   * @returns {boolean} Whether consent was granted
   */
  function requestConsent(consentType, reason) {
    try {
      // Check if already granted
      if (checkConsent(consentType)) {
        return true;
      }
      
      const ui = getHostAppUI();
      if (!ui) {
        return false;
      }
      
      const messages = {
        advancedAI: '🤖 Advanced AI Processing\n\n' +
                   'This feature requires sending document content to a secure AI service for advanced analysis.\n\n' +
                   '🔒 Your data will be:\n' +
                   '• Encrypted in transit\n' +
                   '• Processed on secure servers\n' +
                   '• Never stored permanently\n' +
                   '• Never shared with third parties\n\n' +
                   'Reason: ' + reason + '\n\n' +
                   'Grant permission?',
        
        analytics: '📊 Usage Analytics\n\n' +
                  'This allows collection of anonymous usage statistics to improve the add-on.\n\n' +
                  '✓ What we collect:\n' +
                  '• Feature usage counts\n' +
                  '• Error reports\n' +
                  '• Performance metrics\n\n' +
                  '✗ What we DON\'T collect:\n' +
                  '• Document content\n' +
                  '• Personal information\n' +
                  '• File names or metadata\n\n' +
                  'Grant permission?',
        
        templateSharing: '📋 Template Sharing\n\n' +
                        'This allows accessing shared template library from Google Drive.\n\n' +
                        'Grant permission?'
      };
      
      const message = messages[consentType] || 'Grant permission for: ' + consentType + '?\n\nReason: ' + reason;
      
      const response = ui.alert(
        'Privacy Consent Required',
        message,
        ui.ButtonSet.YES_NO
      );
      
      const granted = response === ui.Button.YES;
      
      if (granted) {
        updateConsent(consentType, true);
      }
      
      return granted;
    } catch (e) {
      console.error('Error requesting consent:', e);
      return false;
    }
  }
  
  /**
   * Revokes all consents and resets to defaults
   * @returns {Object} Reset consent settings
   */
  function revokeAllConsent() {
    try {
      const defaultConsent = getDefaultConsent();
      const userProperties = PropertiesService.getUserProperties();
      userProperties.setProperty(CONSENT_PROPERTY_KEY, JSON.stringify(defaultConsent));
      
      logPrivacyEvent('consent_revoke_all', {});
      
      return defaultConsent;
    } catch (e) {
      console.error('Error revoking consent:', e);
      return getDefaultConsent();
    }
  }
  
  /**
   * Validates data before processing based on consent
   * @param {string} operation - Operation being performed
   * @param {Object} data - Data to be processed
   * @returns {Object} Validation result
   */
  function validateDataProcessing(operation, data) {
    const validation = {
      allowed: false,
      reason: '',
      requiresConsent: false,
      consentType: null
    };
    
    // Map operations to consent types
    const operationConsentMap = {
      'summarize': CONSENT_TYPES.ADVANCED_AI,
      'advanced_analysis': CONSENT_TYPES.ADVANCED_AI,
      'redact': CONSENT_TYPES.REDACTION,
      'track_analytics': CONSENT_TYPES.ANALYTICS,
      'share_template': CONSENT_TYPES.TEMPLATE_SHARING
    };
    
    const requiredConsent = operationConsentMap[operation];
    
    if (!requiredConsent) {
      // Operation doesn't require special consent
      validation.allowed = true;
      validation.reason = 'No special consent required';
      return validation;
    }
    
    validation.requiresConsent = true;
    validation.consentType = requiredConsent;
    
    if (checkConsent(requiredConsent)) {
      validation.allowed = true;
      validation.reason = 'Consent granted';
    } else {
      validation.allowed = false;
      validation.reason = 'Consent required but not granted';
    }
    
    return validation;
  }
  
  /**
   * Ensures data is processed locally unless consent is granted
   * @param {string} operation - Operation to perform
   * @param {Function} localFn - Function to execute locally
   * @param {Function} remoteFn - Function to execute remotely (requires consent)
   * @returns {*} Result from appropriate function
   */
  function processWithPrivacyGate(operation, localFn, remoteFn) {
    const validation = validateDataProcessing(operation, {});
    
    if (validation.allowed && validation.requiresConsent) {
      // User has consented to remote processing
      logPrivacyEvent('remote_processing', { operation });
      return remoteFn();
    } else if (!validation.requiresConsent) {
      // No consent needed, safe to process locally
      return localFn();
    } else {
      // Consent required but not granted - use local processing
      logPrivacyEvent('local_processing_fallback', { operation });
      return localFn();
    }
  }
  
  /**
   * Gets privacy policy text
   * @returns {string} Privacy policy
   */
  function getPrivacyPolicy() {
    return '🔒 PRIVACY POLICY - Intelligent Document Automation\n\n' +
           '1. LOCAL-FIRST PROCESSING\n' +
           'All document analysis and automation runs locally in your Google Workspace environment by default.\n\n' +
           '2. DATA COLLECTION\n' +
           '• We do NOT collect your document content\n' +
           '• We do NOT collect personal information\n' +
           '• We do NOT share data with third parties\n\n' +
           '3. OPTIONAL FEATURES\n' +
           'Advanced AI features require explicit consent and may send data to secure servers:\n' +
           '• Data is encrypted in transit (TLS 1.3)\n' +
           '• Data is never stored permanently\n' +
           '• Data is processed only for requested features\n\n' +
           '4. ANALYTICS (OPTIONAL)\n' +
           'If you opt in, we collect anonymous usage statistics:\n' +
           '• Feature usage counts\n' +
           '• Error reports for debugging\n' +
           '• NO document content or personal data\n\n' +
           '5. YOUR RIGHTS\n' +
           '• You can revoke consent at any time\n' +
           '• You can request data deletion\n' +
           '• You control what data is processed\n\n' +
           '6. SECURITY\n' +
           '• All data transmission uses encryption\n' +
           '• Access is limited to authorized operations\n' +
           '• Regular security audits\n\n' +
           'Last Updated: ' + new Date().toDateString();
  }
  
  /**
   * Shows privacy dashboard to user
   */
  function showPrivacyDashboard() {
    const consent = getConsent();
    const ui = getHostAppUI();
    
    if (!ui) return;
    
    const status = '📊 CURRENT PRIVACY SETTINGS\n\n' +
                  '✅ Basic Features: Always Enabled\n' +
                  '🤖 Advanced AI: ' + (consent.advancedAI ? '✅ Enabled' : '❌ Disabled') + '\n' +
                  '🔒 Redaction: ' + (consent.redaction ? '✅ Enabled' : '❌ Disabled') + '\n' +
                  '📈 Analytics: ' + (consent.analytics ? '✅ Enabled' : '❌ Disabled') + '\n' +
                  '📋 Template Sharing: ' + (consent.templateSharing ? '✅ Enabled' : '❌ Disabled') + '\n\n' +
                  'Last Updated: ' + new Date(consent.timestamp).toLocaleString();
    
    ui.alert('Privacy Dashboard', status, ui.ButtonSet.OK);
  }
  
  /**
   * Logs privacy-related events
   * @param {string} eventType - Type of event
   * @param {Object} metadata - Event metadata
   */
  function logPrivacyEvent(eventType, metadata) {
    try {
      const log = {
        timestamp: new Date().toISOString(),
        event: eventType,
        metadata: metadata,
        user: Session.getActiveUser().getEmail()
      };
      
      console.info('Privacy Event:', JSON.stringify(log));
      
      // Could also store in user properties for audit trail
      if (checkConsent(CONSENT_TYPES.ANALYTICS)) {
        AnalyticsService.trackEvent('privacy_event', { type: eventType });
      }
    } catch (e) {
      console.error('Error logging privacy event:', e);
    }
  }
  
  /**
   * Gets default consent settings
   * @returns {Object} Default consent
   */
  function getDefaultConsent() {
    return {
      basic: true,
      advancedAI: false,
      redaction: true,
      analytics: false,
      templateSharing: false,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Gets host app UI
   * @returns {Ui|null} UI object
   */
  function getHostAppUI() {
    try {
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
  
  // Public API
  return {
    getConsent: getConsent,
    updateConsent: updateConsent,
    checkConsent: checkConsent,
    requestConsent: requestConsent,
    revokeAllConsent: revokeAllConsent,
    validateDataProcessing: validateDataProcessing,
    processWithPrivacyGate: processWithPrivacyGate,
    getPrivacyPolicy: getPrivacyPolicy,
    showPrivacyDashboard: showPrivacyDashboard,
    CONSENT_TYPES: CONSENT_TYPES
  };
  
})();
