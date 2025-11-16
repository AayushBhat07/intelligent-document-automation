/**
 * Analytics Service
 * Privacy-preserving usage tracking and reporting
 */

const AnalyticsService = (function() {
  
  const ANALYTICS_PROPERTY_KEY = 'usageAnalytics';
  const MAX_EVENTS = 1000; // Maximum events to store locally
  
  /**
   * Tracks an event
   * @param {string} eventName - Name of the event
   * @param {Object} metadata - Event metadata (no PII)
   */
  function trackEvent(eventName, metadata = {}) {
    try {
      // Check if analytics consent is granted
      if (!PrivacyGateController.checkConsent('analytics')) {
        // Store minimal local stats only
        updateLocalStats(eventName);
        return;
      }
      
      // Sanitize metadata to ensure no PII
      const sanitizedMetadata = sanitizeMetadata(metadata);
      
      const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        metadata: sanitizedMetadata,
        session: getSessionId()
      };
      
      // Store locally
      storeEvent(event);
      
      // Optionally send to backend (if configured and consented)
      if (shouldSendToBackend()) {
        sendEventToBackend(event);
      }
    } catch (e) {
      console.error('Error tracking event:', e);
    }
  }
  
  /**
   * Gets usage statistics
   * @returns {Object} Usage stats
   */
  function getUsageStats() {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const statsJson = userProperties.getProperty(ANALYTICS_PROPERTY_KEY);
      
      if (statsJson) {
        return JSON.parse(statsJson);
      }
      
      return getDefaultStats();
    } catch (e) {
      console.error('Error getting usage stats:', e);
      return getDefaultStats();
    }
  }
  
  /**
   * Updates local statistics
   * @param {string} eventName - Event name
   */
  function updateLocalStats(eventName) {
    const stats = getUsageStats();
    
    // Increment total actions
    stats.totalActions = (stats.totalActions || 0) + 1;
    
    // Increment specific action counter
    if (!stats.actions) {
      stats.actions = {};
    }
    stats.actions[eventName] = (stats.actions[eventName] || 0) + 1;
    
    // Update last used timestamp
    stats.lastUsed = new Date().toISOString();
    
    // Estimate time saved (rough heuristics)
    const timeSavedMinutes = estimateTimeSaved(eventName);
    stats.timeSavedMinutes = (stats.timeSavedMinutes || 0) + timeSavedMinutes;
    stats.timeSaved = formatTimeSaved(stats.timeSavedMinutes);
    
    // Save updated stats
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(ANALYTICS_PROPERTY_KEY, JSON.stringify(stats));
  }
  
  /**
   * Stores an event locally
   * @param {Object} event - Event to store
   */
  function storeEvent(event) {
    updateLocalStats(event.name);
    
    // Store full event details if analytics consent is granted
    const scriptProperties = PropertiesService.getScriptProperties();
    const eventsKey = 'events_' + getSessionId();
    const eventsJson = scriptProperties.getProperty(eventsKey);
    
    let events = eventsJson ? JSON.parse(eventsJson) : [];
    events.push(event);
    
    // Limit stored events
    if (events.length > MAX_EVENTS) {
      events = events.slice(-MAX_EVENTS);
    }
    
    scriptProperties.setProperty(eventsKey, JSON.stringify(events));
  }
  
  /**
   * Gets all stored events
   * @returns {Array} Array of events
   */
  function getEvents() {
    try {
      const scriptProperties = PropertiesService.getScriptProperties();
      const eventsKey = 'events_' + getSessionId();
      const eventsJson = scriptProperties.getProperty(eventsKey);
      
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (e) {
      console.error('Error getting events:', e);
      return [];
    }
  }
  
  /**
   * Gets event summary by type
   * @returns {Object} Summary of events by type
   */
  function getEventSummary() {
    const stats = getUsageStats();
    const summary = {
      totalActions: stats.totalActions || 0,
      timeSaved: stats.timeSaved || '0 min',
      topActions: [],
      lastUsed: stats.lastUsed || 'Never'
    };
    
    if (stats.actions) {
      const sortedActions = Object.entries(stats.actions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      summary.topActions = sortedActions.map(([action, count]) => ({
        action: formatActionName(action),
        count
      }));
    }
    
    return summary;
  }
  
  /**
   * Generates analytics report
   * @param {string} period - Report period ('day', 'week', 'month', 'all')
   * @returns {Object} Analytics report
   */
  function generateReport(period = 'all') {
    const events = getEvents();
    const stats = getUsageStats();
    const cutoffDate = getCutoffDate(period);
    
    const filteredEvents = events.filter(event => {
      return new Date(event.timestamp) >= cutoffDate;
    });
    
    const report = {
      period,
      totalEvents: filteredEvents.length,
      totalActions: stats.totalActions || 0,
      timeSaved: stats.timeSaved || '0 min',
      eventsByType: {},
      timeline: []
    };
    
    // Group events by type
    filteredEvents.forEach(event => {
      if (!report.eventsByType[event.name]) {
        report.eventsByType[event.name] = 0;
      }
      report.eventsByType[event.name]++;
    });
    
    return report;
  }
  
  /**
   * Exports analytics data
   * @returns {string} CSV formatted analytics data
   */
  function exportAnalytics() {
    const events = getEvents();
    
    let csv = 'Timestamp,Event,Metadata\n';
    events.forEach(event => {
      const metadata = JSON.stringify(event.metadata).replace(/"/g, '""');
      csv += `${event.timestamp},${event.name},"${metadata}"\n`;
    });
    
    return csv;
  }
  
  /**
   * Clears all analytics data
   */
  function clearAnalytics() {
    try {
      const userProperties = PropertiesService.getUserProperties();
      userProperties.deleteProperty(ANALYTICS_PROPERTY_KEY);
      
      const scriptProperties = PropertiesService.getScriptProperties();
      const eventsKey = 'events_' + getSessionId();
      scriptProperties.deleteProperty(eventsKey);
      
      return { success: true, message: 'Analytics data cleared' };
    } catch (e) {
      console.error('Error clearing analytics:', e);
      return { success: false, message: 'Error: ' + e.message };
    }
  }
  
  // Helper functions
  
  /**
   * Sanitizes metadata to remove PII
   * @param {Object} metadata - Raw metadata
   * @returns {Object} Sanitized metadata
   */
  function sanitizeMetadata(metadata) {
    const sanitized = {};
    const allowedKeys = ['count', 'type', 'method', 'format', 'category', 'docType', 'length'];
    
    Object.keys(metadata).forEach(key => {
      if (allowedKeys.includes(key)) {
        // Store only whitelisted, non-PII data
        const value = metadata[key];
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
      }
    });
    
    return sanitized;
  }
  
  /**
   * Gets or creates session ID
   * @returns {string} Session ID
   */
  function getSessionId() {
    const scriptProperties = PropertiesService.getScriptProperties();
    let sessionId = scriptProperties.getProperty('sessionId');
    
    if (!sessionId) {
      sessionId = Utilities.getUuid();
      scriptProperties.setProperty('sessionId', sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Estimates time saved by an action
   * @param {string} eventName - Event name
   * @returns {number} Estimated minutes saved
   */
  function estimateTimeSaved(eventName) {
    // Rough estimates of time saved per action
    const timeSavings = {
      'analyze_document': 2,
      'remove_duplicates': 5,
      'standardize_dates': 3,
      'fill_empty_cells': 4,
      'redact_pii': 10,
      'apply_template': 15,
      'summarize': 8,
      'remove_empty_rows': 2,
      'standardize_currency': 3,
      'trim_whitespace': 1,
      'capitalize_text': 2
    };
    
    return timeSavings[eventName] || 1;
  }
  
  /**
   * Formats time saved for display
   * @param {number} minutes - Minutes
   * @returns {string} Formatted time
   */
  function formatTimeSaved(minutes) {
    if (minutes < 60) {
      return minutes + ' min';
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours < 24) {
      return `${hours}h ${mins}m`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  /**
   * Formats action name for display
   * @param {string} actionName - Action name
   * @returns {string} Formatted name
   */
  function formatActionName(actionName) {
    return actionName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Gets cutoff date for report period
   * @param {string} period - Period
   * @returns {Date} Cutoff date
   */
  function getCutoffDate(period) {
    const now = new Date();
    
    switch(period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // Beginning of time
    }
  }
  
  /**
   * Checks if events should be sent to backend
   * @returns {boolean} Whether to send to backend
   */
  function shouldSendToBackend() {
    // Only send if analytics consent is granted and backend is configured
    return PrivacyGateController.checkConsent('analytics') && false; // Backend disabled by default
  }
  
  /**
   * Sends event to backend
   * @param {Object} event - Event to send
   */
  function sendEventToBackend(event) {
    // Placeholder for backend integration
    // Would use UrlFetchApp to send to analytics service
    Logger.log('Backend analytics disabled');
  }
  
  /**
   * Gets default stats object
   * @returns {Object} Default stats
   */
  function getDefaultStats() {
    return {
      totalActions: 0,
      timeSavedMinutes: 0,
      timeSaved: '0 min',
      actions: {},
      firstUsed: new Date().toISOString(),
      lastUsed: null
    };
  }
  
  // Public API
  return {
    trackEvent: trackEvent,
    getUsageStats: getUsageStats,
    getEventSummary: getEventSummary,
    generateReport: generateReport,
    exportAnalytics: exportAnalytics,
    clearAnalytics: clearAnalytics
  };
  
})();
