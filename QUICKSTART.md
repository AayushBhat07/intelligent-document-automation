# 🚀 Quick Start Guide

## Intelligent Document Automation for Google Workspace

Get up and running with smart document automation in under 5 minutes! 🎉

---

## For End Users

### Installation

1. **Open a Google Doc, Sheet, or Slide**
2. **Click the Add-ons menu** (or Extensions in newer Google Workspace)
3. **Search for**: "Intelligent Document Automation"
4. **Click Install** and grant permissions
5. **Refresh** your document

### First Use

1. **Open the sidebar**:
   - Add-ons → Intelligent Document Automation → Open Smart Automation
   
2. **Run your first analysis**:
   - The sidebar opens automatically
   - Click "🔍 Analyze Document"
   - Review suggested improvements

3. **Try a quick action**:
   - Go to the "Clean" tab
   - Click "🗑️ Remove Duplicates" (if you have a spreadsheet)
   - See instant results!

---

## For Developers

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/AayushBhat07/intelligent-document-automation.git
cd intelligent-document-automation

# 2. Install dependencies
npm install

# 3. Install clasp globally (if not already installed)
npm install -g @google/clasp

# 4. Login to Google
clasp login

# 5. Create a new Apps Script project
clasp create --type standalone --title "Intelligent Document Automation"

# 6. Push code to Apps Script
clasp push

# 7. Open in browser
clasp open
```

### Testing Your Changes

```bash
# Push changes
clasp push

# Watch for changes (auto-push)
clasp push --watch

# View logs
clasp logs

# Pull remote changes
clasp pull
```

### Project Structure

```
intelligent-document-automation/
├── src/
│   ├── Main.js                          # Entry point, menu handlers
│   ├── services/
│   │   ├── DocumentAnalysisEngine.js    # Document analysis
│   │   ├── AutomationRuleProcessor.js   # Automation macros
│   │   ├── RedactionService.js          # PII detection/redaction
│   │   ├── PrivacyGateController.js     # Consent management
│   │   ├── TemplateManager.js           # Template system
│   │   ├── SummarizationService.js      # Text summarization
│   │   └── AnalyticsService.js          # Usage tracking
│   ├── handlers/
│   │   └── SidebarHandlers.js           # UI event handlers
│   ├── utils/
│   │   └── Utils.js                     # Helper functions
│   └── ui/
│       └── Sidebar.html                 # Sidebar interface
├── appsscript.json                      # Apps Script manifest
├── package.json                         # NPM configuration
├── README.md                            # User documentation
├── ADMIN_GUIDE.md                       # Admin deployment guide
└── LICENSE                              # MIT License
```

---

## For Administrators

### Quick Domain Deployment

1. **Create Apps Script Project**:
   - Go to [script.google.com](https://script.google.com)
   - New Project → Copy all files from `src/`

2. **Deploy**:
   - Deploy → New deployment → Editor Add-on
   - Copy deployment ID

3. **Install Domain-Wide**:
   - [admin.google.com](https://admin.google.com) → Apps → Marketplace apps
   - Add app → By deployment ID
   - Install for domain

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for detailed instructions.

---

## Common Tasks

### How to: Redact PII

1. Open sidebar
2. Click "Redact" tab
3. Click "🔍 Detect PII"
4. Review found items
5. Click "🚫 Redact Sensitive Data"

### How to: Apply a Template

1. Open sidebar
2. Click "Templates" tab
3. Browse available templates
4. Click template name
5. Confirm application

### How to: Export Analytics

1. Add-ons → Intelligent Document Automation → Usage Analytics
2. Click "Export Data"
3. Download CSV file

### How to: Manage Privacy

1. Add-ons → Intelligent Document Automation → Privacy & Permissions
2. Toggle features on/off
3. Review what data is collected
4. Revoke consent anytime

---

## Troubleshooting

### Issue: "Authorization required"
**Solution**: Click "Authorize" and grant permissions. This is normal on first use.

### Issue: Add-on menu doesn't appear
**Solution**: 
- Refresh the page
- Check you're in Docs/Sheets/Slides (not Drive)
- Verify add-on is installed

### Issue: Operations timeout
**Solution**:
- Process smaller selections
- Large documents may take longer
- Check internet connection

### Issue: Can't find detected PII
**Solution**:
- PII patterns are configurable
- Add custom patterns for your use case
- Some formats may not match built-in patterns

---

## Getting Help

- 📚 **Documentation**: [Full README](README.md)
- 🐛 **Report Bug**: [GitHub Issues](https://github.com/AayushBhat07/intelligent-document-automation/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AayushBhat07/intelligent-document-automation/discussions)
- 📧 **Email**: support@example.com

---

## What's Next?

- ⭐ **Star the repo** on GitHub
- 📣 **Share** with your team
- 🐛 **Report issues** you find
- 💡 **Suggest features** you'd like
- 🤝 **Contribute** improvements

---

**Made with 🚀 by [@AayushBhat07](https://github.com/AayushBhat07)**

*Automate all the things!* ✨
