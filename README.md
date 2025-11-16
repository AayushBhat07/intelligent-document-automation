# 🤖 Intelligent Document Automation - Google Workspace Add-on

> **Automate repetitive tasks in Google Docs, Sheets, and Slides with AI-powered intelligence! ✨**

Transform your document workflow with smart automation that respects your privacy. No more manual formatting, duplicate hunting, or PII nightmares! 🎉

## 🌟 Features

### 📊 Smart Document Analysis
- **Automatic Issue Detection**: Identifies formatting inconsistencies, duplicates, mixed data types, and anomalies
- **Actionable Suggestions**: Get specific recommendations for improving your documents
- **Multi-Platform Support**: Works seamlessly across Docs, Sheets, and Slides

### 🔒 Privacy-First Redaction
- **PII Detection**: Automatically finds emails, phone numbers, SSN, credit cards, and more
- **One-Click Redaction**: Mask sensitive information instantly
- **Custom Patterns**: Define your own redaction rules
- **100% Local Processing**: Your data never leaves Google's servers by default

### ✨ Intelligent Cleanup & Formatting
- **Remove Duplicates**: Clean up duplicate rows or entries
- **Standardize Formats**: Unify date, currency, and text formatting
- **Fill Empty Cells**: Intelligently populate blank cells based on context
- **Trim & Capitalize**: Batch text operations with smart formatting

### 📝 Advanced Summarization
- **Local Processing**: Quick summaries without external API calls
- **Key Point Extraction**: Bullet-point highlights from long documents
- **Text Statistics**: Word count, reading time, and more
- **Optional AI Enhancement**: Opt-in for advanced AI processing (with explicit consent)

### 📋 Template System
- **Built-in Templates**: Grading rubrics, contracts, sales reports, presentation styles
- **Custom Templates**: Import your own from Google Drive
- **Quick Apply**: One-click template application
- **Preview Support**: See before you apply

### 📈 Usage Analytics (Optional)
- **Privacy-Preserving**: No PII collected, ever
- **Time Saved Tracking**: See how much time automation saves you
- **Usage Reports**: Understand which features help you most
- **Fully Opt-In**: Analytics disabled by default

## 🚀 Installation

### For Individual Users

1. **Install from Google Workspace Marketplace** (when published):
   - Visit [Google Workspace Marketplace](https://workspace.google.com/marketplace)
   - Search for "Intelligent Document Automation"
   - Click "Install" and grant required permissions

2. **Manual Installation** (for development):
   ```bash
   # Clone the repository
   git clone https://github.com/AayushBhat07/intelligent-document-automation.git
   cd intelligent-document-automation
   
   # Install clasp (Google Apps Script CLI)
   npm install -g @google/clasp
   
   # Login to Google
   clasp login
   
   # Create a new Apps Script project
   clasp create --type standalone --title "Intelligent Document Automation"
   
   # Push code to Apps Script
   clasp push
   
   # Open in Apps Script editor
   clasp open
   ```

### For Domain Administrators

#### Prerequisites
- Google Workspace admin access
- Domain-wide delegation enabled
- Apps Script API enabled

#### Deployment Steps

1. **Create Apps Script Project**:
   - Go to [Apps Script](https://script.google.com)
   - Create new project
   - Copy all files from `src/` directory

2. **Configure OAuth Scopes**:
   - The add-on requests minimal scopes:
     - `documents.currentonly` - Access current document only
     - `spreadsheets.currentonly` - Access current spreadsheet only
     - `presentations.currentonly` - Access current presentation only
     - `drive.file` - Access files created or opened by the add-on
     - `script.container.ui` - Display UI inside Google apps

3. **Deploy as Add-on**:
   ```bash
   # Using clasp
   clasp deploy --description "v1.0.0 - Initial Release"
   ```

4. **Domain-Wide Installation**:
   - Go to Google Admin Console
   - Navigate to: Apps → Google Workspace Marketplace apps
   - Click "Add app" → "Add from URL"
   - Enter deployment ID
   - Select "Install for entire domain" or specific OUs
   - Review and approve permissions

5. **Configure Privacy Settings** (Optional):
   - Set default consent preferences via Admin SDK
   - Configure template library location
   - Set up analytics collection (if desired)

## 📖 Usage Guide

### Opening the Add-on

1. Open any Google Doc, Sheet, or Slide
2. Click **Add-ons** → **Intelligent Document Automation** → **Open Smart Automation**
3. The sidebar will appear on the right side

### Quick Start

#### Analyze Your Document
1. Click the **Analyze** tab
2. Click **🔍 Analyze Document**
3. Review detected issues and suggestions
4. Click individual suggestions to apply fixes

#### Redact Sensitive Information
1. Click the **Redact** tab
2. Click **🔍 Detect PII** to find sensitive data
3. Review found items
4. Click **🚫 Redact Sensitive Data** to mask them

#### Clean & Format
1. Click the **Clean** tab
2. Select desired operation:
   - **Remove Duplicates**: Clean duplicate rows
   - **Standardize Dates**: Unify date formats
   - **Fill Empty Cells**: Intelligently populate blanks

#### Apply Templates
1. Click the **Templates** tab
2. Browse available templates
3. Click a template to preview
4. Click **Apply** to use it

### Advanced Features

#### Custom Redaction Patterns
```javascript
// In Apps Script editor, you can define custom patterns
RedactionService.customRedaction('\\b[A-Z]{2}\\d{6}\\b', '[ID REDACTED]');
```

#### Batch Processing
The add-on automatically handles large documents by:
- Processing in chunks to avoid timeouts
- Showing progress indicators
- Providing undo/rollback options

## 🔐 Privacy & Security

### Our Privacy Commitment

✅ **What we DO**:
- Process all data locally in Google Apps Script by default
- Request minimal OAuth scopes
- Provide clear consent prompts for advanced features
- Allow you to revoke permissions anytime
- Store only anonymous usage statistics (if opted in)

❌ **What we DON'T**:
- Share your data with third parties
- Store document content on external servers
- Collect personally identifiable information
- Track your documents or files
- Sell or monetize your data

### Data Processing Locations

| Feature | Processing Location | Requires Consent |
|---------|-------------------|------------------|
| Document Analysis | Local (Apps Script) | No |
| Redaction | Local (Apps Script) | Yes (basic) |
| Cleanup Operations | Local (Apps Script) | No |
| Template Application | Local (Apps Script) | No |
| Basic Summarization | Local (Apps Script) | No |
| Advanced AI Summarization | Optional Backend | Yes (explicit) |
| Usage Analytics | Local Storage | Yes (opt-in) |

### Managing Privacy Settings

1. Click **Add-ons** → **Intelligent Document Automation** → **Privacy & Permissions**
2. Review current settings
3. Toggle features on/off
4. View privacy policy
5. Export or delete your data

## 🛠️ Configuration

### User Settings

Access via: **Add-ons** → **Intelligent Document Automation** → **Settings**

- **Auto-analyze**: Automatically analyze documents when opened
- **Default date format**: Set preferred date format for standardization
- **Template library**: Configure custom template folder in Drive

### Admin Configuration

Admins can pre-configure settings for all users:

```javascript
// In Apps Script, admins can set organization defaults
PropertiesService.getScriptProperties().setProperty('defaultDateFormat', 'YYYY-MM-DD');
PropertiesService.getScriptProperties().setProperty('autoAnalyze', 'true');
```

## 🐛 Troubleshooting

### Common Issues

**Add-on doesn't appear in menu**
- Ensure you're using a supported Google Workspace app (Docs, Sheets, Slides)
- Refresh the page
- Check that the add-on is installed for your account/domain

**"Authorization required" error**
- Click "Authorize" and grant requested permissions
- Make sure you're signed in with the correct Google account
- Check with your admin if domain policies block add-ons

**Operations fail or timeout**
- Try processing smaller selections
- Check internet connection
- Large documents may take longer - wait for progress indicator

**PII detection misses items**
- Patterns are configurable - add custom patterns for your use case
- Some formats may not match built-in patterns
- Use custom redaction for organization-specific identifiers

### Getting Help

- 📚 Check the [Wiki](https://github.com/AayushBhat07/intelligent-document-automation/wiki)
- 🐛 Report issues on [GitHub Issues](https://github.com/AayushBhat07/intelligent-document-automation/issues)
- 💬 Join discussions in [GitHub Discussions](https://github.com/AayushBhat07/intelligent-document-automation/discussions)
- 📧 Contact support: support@example.com

## 📊 Performance & Limits

### Google Apps Script Quotas

Be aware of [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas):
- **Execution time**: 6 minutes per execution (consumer), 30 minutes (workspace)
- **URL Fetch calls**: 20,000 per day (consumer), unlimited (workspace)
- **Properties Service**: 500 KB per store

### Optimization Tips

- Process large documents in batches
- Use selection-based operations for very large files
- Enable caching for repeated operations
- Avoid running multiple operations simultaneously

## 🔄 Updates & Versioning

The add-on follows semantic versioning:
- **Major versions** (1.0.0 → 2.0.0): Breaking changes
- **Minor versions** (1.0.0 → 1.1.0): New features
- **Patch versions** (1.0.0 → 1.0.1): Bug fixes

Updates are automatic through Google Workspace Marketplace.

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/AayushBhat07/intelligent-document-automation.git
cd intelligent-document-automation

# Install dependencies
npm install

# Login to clasp
clasp login

# Link to your Apps Script project
clasp clone <your-script-id>

# Make changes and push
clasp push
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Google Apps Script
- Icons from Google Material Design
- Inspired by feedback from educators, legal ops, and sales teams worldwide

## 📞 Support

- **GitHub**: [@AayushBhat07](https://github.com/AayushBhat07)
- **Issues**: [Report a bug](https://github.com/AayushBhat07/intelligent-document-automation/issues)
- **Discussions**: [Ask questions](https://github.com/AayushBhat07/intelligent-document-automation/discussions)

---

**Made with 🚀 by [@AayushBhat07](https://github.com/AayushBhat07)**

*Because life's too short for manual document formatting!* ✨
