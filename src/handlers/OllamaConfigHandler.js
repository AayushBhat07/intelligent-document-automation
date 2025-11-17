/**
 * Simple AI Configuration
 * Just enter your API key and it works
 */

function configureOllama() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const currentKey = SimpleAIService.getApiKey();
  const hasKey = currentKey && currentKey.length > 0;
  
  let message = '🤖 Configure AI (Google Gemini)\n\n';
  
  if (hasKey) {
    message += '✅ Status: Configured\n';
    message += `🔑 Key: ${currentKey.substring(0, 8)}...\n\n`;
    message += 'Enter new key to update, or Cancel to keep.';
  } else {
    message += '❌ Status: Not Configured\n\n';
    message += 'Get FREE API key:\n';
    message += '1. Go to: aistudio.google.com/apikey\n';
    message += '2. Click "Create API Key"\n';
    message += '3. Copy and paste below\n\n';
    message += '✅ Free forever\n';
    message += '✅ No tunneling BS\n';
    message += '✅ Just works';
  }
  
  const response = ui.prompt(
    'AI Configuration',
    message,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const newKey = response.getResponseText().trim();
    if (newKey && newKey.length > 0) {
      SimpleAIService.setApiKey(newKey);
      
      const test = SimpleAIService.checkConnection();
      if (test.connected) {
        ui.alert(
          'Success!',
          '✅ AI is ready!\n\nYou can now use:\n• Summarization\n• Grammar fixing\n• Document analysis',
          ui.ButtonSet.OK
        );
      } else {
        ui.alert(
          'Error',
          '❌ ' + test.error + '\n\nCheck your API key.',
          ui.ButtonSet.OK
        );
      }
    }
  }
}

function testOllama() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  const status = SimpleAIService.checkConnection();
  
  if (status.connected) {
    ui.alert(
      'Connection Test',
      '✅ AI is working!\n\nModel: gemini-1.5-flash',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Connection Test',
      '❌ ' + status.error,
      ui.ButtonSet.OK
    );
  }
}

function showOllamaGuide() {
  const ui = getHostAppUI();
  if (!ui) return;
  
  ui.alert(
    'Quick Setup',
    '🚀 SIMPLE SETUP\n\n' +
    '1. Visit: aistudio.google.com/apikey\n' +
    '2. Click "Create API Key"\n' +
    '3. Copy the key\n' +
    '4. Click Configure and paste\n\n' +
    '✅ Free\n' +
    '✅ No setup\n' +
    '✅ Just works',
    ui.ButtonSet.OK
  );
  
  const response = ui.alert(
    'Configure Now?',
    'Ready to set up AI?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    configureOllama();
  }
}
