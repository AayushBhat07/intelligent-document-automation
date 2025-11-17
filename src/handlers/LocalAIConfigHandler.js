/**
 * Local AI Configuration Handler
 * Helps users set up and configure their local AI server
 */

/**
 * Shows configuration dialog for local AI server
 */
function configureLocalAI() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const currentURL = LocalAIService.getServerURL();
  const status = LocalAIService.checkConnection();
  
  let message = '🤖 Configure Local AI Server\n\n';
  
  if (status.connected) {
    message += '✅ Status: Connected\n';
    message += `📡 Server: ${currentURL}\n`;
    message += `🔧 Models loaded: ${status.models_loaded.join(', ')}\n\n`;
    message += 'Your local AI is working! You can now use privacy-preserving AI features.\n\n';
    message += 'Click OK to keep current settings, or enter a new URL below.';
  } else {
    message += '❌ Status: Not Connected\n\n';
    if (currentURL) {
      message += `Current URL: ${currentURL}\n`;
      message += `Error: ${status.error}\n\n`;
    }
    message += '📋 Setup Instructions:\n';
    message += '1. Run local AI server on your laptop\n';
    message += '2. Expose it using ngrok or Cloudflare Tunnel\n';
    message += '3. Enter the public URL below\n\n';
    message += 'Example: https://abc123.ngrok-free.app';
  }
  
  const response = ui.prompt(
    'Local AI Configuration',
    message,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const newURL = response.getResponseText().trim();
    if (newURL && newURL.length > 0) {
      LocalAIService.setServerURL(newURL);
      
      // Test connection
      const testStatus = LocalAIService.checkConnection();
      if (testStatus.connected) {
        ui.alert(
          'Success!',
          '✅ Successfully connected to your local AI server!\n\n' +
          'You can now use AI-powered features with complete privacy.',
          ui.ButtonSet.OK
        );
      } else {
        ui.alert(
          'Connection Failed',
          '❌ Could not connect to: ' + newURL + '\n\n' +
          'Error: ' + testStatus.error + '\n\n' +
          'Please check:\n' +
          '• Server is running\n' +
          '• URL is correct\n' +
          '• Firewall allows connections',
          ui.ButtonSet.OK
        );
      }
    }
  }
}

/**
 * Test local AI connection
 */
function testLocalAIConnection() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const status = LocalAIService.checkConnection();
  
  if (status.connected) {
    ui.alert(
      'Connection Test',
      '✅ Successfully connected to local AI server!\n\n' +
      `Server: ${LocalAIService.getServerURL()}\n` +
      `Status: ${status.status}\n` +
      `Models: ${status.models_loaded.join(', ')}`,
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Connection Test',
      '❌ Connection failed\n\n' +
      `Error: ${status.error}\n\n` +
      'Please configure your local AI server using:\n' +
      'Extensions → Smart Automation → Configure Local AI',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Show local AI setup wizard
 */
function showLocalAISetupWizard() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const setupInstructions = 
    '🚀 LOCAL AI SETUP GUIDE\n\n' +
    '══════════════════════════════════\n' +
    'STEP 1: Install Dependencies\n' +
    '══════════════════════════════════\n' +
    '1. Open Terminal on your laptop\n' +
    '2. Navigate to: local-ai-server/\n' +
    '3. Run: chmod +x setup.sh\n' +
    '4. Run: ./setup.sh\n\n' +
    '══════════════════════════════════\n' +
    'STEP 2: Start the AI Server\n' +
    '══════════════════════════════════\n' +
    '1. Activate environment: source venv/bin/activate\n' +
    '2. Start server: python server.py\n' +
    '3. Server will run on http://localhost:5000\n\n' +
    '══════════════════════════════════\n' +
    'STEP 3: Expose to Internet\n' +
    '══════════════════════════════════\n' +
    'Option A - ngrok (Easiest):\n' +
    '  1. Install: brew install ngrok\n' +
    '  2. Run: ngrok http 5000\n' +
    '  3. Copy the https URL (e.g., https://abc123.ngrok-free.app)\n\n' +
    'Option B - Cloudflare Tunnel:\n' +
    '  1. Install: brew install cloudflare/cloudflare/cloudflared\n' +
    '  2. Run: cloudflared tunnel --url http://localhost:5000\n' +
    '  3. Copy the https URL\n\n' +
    '══════════════════════════════════\n' +
    'STEP 4: Configure Add-on\n' +
    '══════════════════════════════════\n' +
    '1. Click "Configure Now" button\n' +
    '2. Paste your ngrok/Cloudflare URL\n' +
    '3. Test connection\n\n' +
    '✅ Done! Your local AI is ready!\n\n' +
    'Models included:\n' +
    '• BART (Summarization)\n' +
    '• FLAN-T5 (Text Generation)\n' +
    '• RoBERTa (Question Answering)\n\n' +
    'All processing happens on YOUR laptop - complete privacy! 🔒';
  
  ui.alert(
    'Local AI Setup Wizard',
    setupInstructions,
    ui.ButtonSet.OK
  );
  
  // Offer to open configuration
  const response = ui.alert(
    'Ready to Configure?',
    'Would you like to configure your local AI server URL now?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    configureLocalAI();
  }
}
