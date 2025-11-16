# 🔐 Admin Deployment Guide

## Google Workspace Add-on: Intelligent Document Automation

This guide is for Google Workspace administrators deploying the Intelligent Document Automation add-on across their organization.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Google Workspace admin access (Super Admin or delegated privileges)
- ✅ Apps Script API enabled in Google Cloud Console
- ✅ Access to Google Admin Console
- ✅ Understanding of OAuth scopes and permissions
- ✅ Organizational privacy/compliance review completed

---

## 🚀 Deployment Steps

### Step 1: Create Apps Script Project

1. **Navigate to Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Sign in with your admin account

2. **Create New Project**:
   - Click **New Project**
   - Name it: "Intelligent Document Automation"

3. **Upload Code Files**:
   - Delete default `Code.gs` file
   - Create files matching the structure:
     ```
     src/
     ├── Main.js
     ├── services/
     │   ├── DocumentAnalysisEngine.js
     │   ├── AutomationRuleProcessor.js
     │   ├── RedactionService.js
     │   ├── PrivacyGateController.js
     │   ├── TemplateManager.js
     │   ├── SummarizationService.js
     │   └── AnalyticsService.js
     ├── handlers/
     │   └── SidebarHandlers.js
     ├── utils/
     │   └── Utils.js
     └── ui/
         └── Sidebar.html
     ```

4. **Add appsscript.json Manifest**:
   - Click **Project Settings** (gear icon)
   - Check **Show "appsscript.json" manifest file**
   - Replace content with provided manifest

### Step 2: Configure Google Cloud Project

1. **Link to Google Cloud Project**:
   - In Apps Script, click **Project Settings**
   - Under "Google Cloud Platform (GCP) Project", click **Change project**
   - Enter your organization's GCP project number
   - Click **Set project**

2. **Enable Required APIs** (in GCP Console):
   - Google Docs API
   - Google Sheets API
   - Google Slides API
   - Google Drive API

3. **Configure OAuth Consent Screen**:
   - Go to GCP Console → APIs & Services → OAuth consent screen
   - User Type: **Internal** (for domain-only deployment)
   - App name: "Intelligent Document Automation"
   - Support email: Your admin email
   - Authorized domains: Your workspace domain
   - Scopes: Will be auto-populated from appsscript.json

### Step 3: Deploy as Add-on

#### Using Apps Script Editor:

1. **Create Deployment**:
   - Click **Deploy** → **New deployment**
   - Type: **Editor Add-on**
   - Description: "v1.0.0 - Production Release"
   - Click **Deploy**

2. **Note Deployment ID**:
   - Copy the deployment ID (looks like: `AKfyc...`)
   - You'll need this for domain-wide installation

#### Using clasp (Alternative):

```bash
# Install clasp
npm install -g @google/clasp

# Clone the project
clasp clone <SCRIPT_ID>

# Deploy
clasp deploy --deploymentId <DEPLOYMENT_ID> --description "v1.0.0"
```

### Step 4: Domain-Wide Installation

1. **Access Admin Console**:
   - Go to [admin.google.com](https://admin.google.com)
   - Navigate to: **Apps** → **Google Workspace Marketplace apps**

2. **Add the Add-on**:
   - Click **Add app** → **Add custom app**
   - Select **By deployment ID**
   - Enter your deployment ID
   - Click **Install**

3. **Configure Installation Options**:
   - **Installation Type**: Choose one:
     - ✅ **Domain install** (all users)
     - ✅ **Specific OUs** (selected departments)
     - ✅ **Groups** (specific user groups)

4. **Review Permissions**:
   - Verify requested scopes:
     - `https://www.googleapis.com/auth/documents.currentonly`
     - `https://www.googleapis.com/auth/spreadsheets.currentonly`
     - `https://www.googleapis.com/auth/presentations.currentonly`
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/script.container.ui`
   - Click **Accept** to approve

5. **Complete Installation**:
   - Click **Continue** → **Finish**
   - Allow 5-10 minutes for propagation

---

## ⚙️ Configuration Options

### Organization-Wide Settings

Set default preferences for all users via Apps Script:

```javascript
// In Apps Script editor, run this once:
function setOrganizationDefaults() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  // Default date format
  scriptProps.setProperty('defaultDateFormat', 'yyyy-MM-dd');
  
  // Auto-analyze on document open
  scriptProps.setProperty('autoAnalyze', 'false');
  
  // Template library folder ID (optional)
  scriptProps.setProperty('templateFolderId', 'YOUR_FOLDER_ID');
  
  // Analytics enabled by default
  scriptProps.setProperty('defaultAnalyticsConsent', 'false');
}
```

### Privacy Policy Compliance

For legal/compliance teams, configure default consent:

```javascript
function setPrivacyDefaults() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  // Disable advanced AI by default
  scriptProps.setProperty('defaultAdvancedAI', 'false');
  
  // Enable redaction by default
  scriptProps.setProperty('defaultRedaction', 'true');
  
  // Privacy policy URL
  scriptProps.setProperty('privacyPolicyUrl', 'https://yourorg.com/privacy');
}
```

### Template Library Setup

1. **Create Shared Template Folder**:
   - Create a folder in Google Drive
   - Name it: "Document Automation Templates"
   - Share with: "Anyone in organization with link"

2. **Add Default Templates**:
   - Upload organization-specific templates
   - Use naming convention: `[Category] Template Name`

3. **Configure in Add-on**:
   ```javascript
   PropertiesService.getScriptProperties()
     .setProperty('templateFolderId', 'YOUR_FOLDER_ID');
   ```

---

## 🔒 Security & Compliance

### OAuth Scope Justification

| Scope | Justification | Risk Level |
|-------|---------------|------------|
| `documents.currentonly` | Read/write current doc only | Low |
| `spreadsheets.currentonly` | Read/write current sheet only | Low |
| `presentations.currentonly` | Read/write current slides only | Low |
| `drive.file` | Access only add-on created files | Low |
| `script.container.ui` | Display sidebar interface | Minimal |

### Data Processing Locations

✅ **Default (Local)**:
- All operations run in Google Apps Script runtime
- Data never leaves Google infrastructure
- No external API calls by default

⚠️ **Optional (User-Consented)**:
- Advanced AI summarization (if backend configured)
- Requires explicit user consent
- Can be disabled organization-wide

### Audit & Compliance

Enable audit logging:

```javascript
function enableAuditLogging() {
  // Log all privacy-sensitive operations
  const scriptProps = PropertiesService.getScriptProperties();
  scriptProps.setProperty('auditLogging', 'true');
  scriptProps.setProperty('auditLogSpreadsheet', 'SPREADSHEET_ID');
}
```

---

## 📊 Monitoring & Analytics

### Usage Reporting

Create an admin dashboard to monitor adoption:

```javascript
function getOrganizationUsageStats() {
  // Query UserProperties across organization
  // Aggregate anonymous usage data
  // Generate reports
}
```

### Error Monitoring

Set up Stackdriver logging:

1. In Apps Script, errors automatically log to Stackdriver
2. Access logs: **View** → **Logs** in Apps Script editor
3. Advanced monitoring: Link to GCP project logs

### Performance Metrics

Monitor execution quotas:

- Go to Apps Script → **Executions**
- Review execution times and failures
- Set up alerts for quota approaching limits

---

## 🆘 Support & Troubleshooting

### Common Admin Issues

**Add-on not appearing for users**:
- Check installation scope (domain, OU, groups)
- Verify users have refreshed their Google apps
- Confirm propagation completed (can take 24 hours)

**Permission errors**:
- Verify OAuth consent screen configured correctly
- Check Cloud Project linked properly
- Ensure APIs enabled in GCP Console

**Quota exceeded errors**:
- Review [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
- Consider upgrading to Google Workspace Enterprise for higher limits
- Implement rate limiting in code if needed

### Getting Admin Support

- 📧 Email: admin-support@example.com
- 📚 Documentation: [Admin Wiki](https://github.com/AayushBhat07/intelligent-document-automation/wiki/admin)
- 🎟️ Priority Support: Available for Enterprise customers

---

## 🔄 Updates & Maintenance

### Deploying Updates

1. **Update Code in Apps Script**
2. **Test in Development**:
   - Use a test deployment
   - Verify with limited user group
3. **Create New Version**:
   - Apps Script → **Manage deployments**
   - Create new version with description
4. **Update Installation**:
   - Admin Console → Update deployment ID
   - Or: Users automatically get updates on next load

### Version Management

Recommended versioning:
- **Major updates**: Require admin approval
- **Minor updates**: Auto-deploy to all users
- **Hotfixes**: Deploy immediately with testing

### Rollback Procedure

If issues arise:

1. **Immediate Rollback**:
   - Apps Script → **Manage deployments**
   - Switch to previous version deployment ID

2. **Disable Add-on**:
   - Admin Console → Apps
   - Turn off the add-on temporarily

3. **Investigate**:
   - Check execution logs
   - Review user reports
   - Test in isolated environment

---

## 📝 Checklist for Go-Live

Before deploying to all users:

- [ ] Code review completed
- [ ] Security audit passed
- [ ] Privacy policy reviewed by legal
- [ ] OAuth scopes approved by security team
- [ ] Tested with pilot user group (10-50 users)
- [ ] Documentation shared with users
- [ ] Support channels established
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented
- [ ] Admin training completed

---

## 📞 Admin Support Contacts

- **Technical Issues**: tech-support@example.com
- **Security Questions**: security@example.com
- **Compliance**: compliance@example.com
- **GitHub Issues**: [Report a bug](https://github.com/AayushBhat07/intelligent-document-automation/issues)

---

**Last Updated**: 2024
**Document Version**: 1.0
**Maintained by**: [@AayushBhat07](https://github.com/AayushBhat07)
