# Glossary

<cite>
**Referenced Files in This Document**
- [src/services/PrivacyGateController.js](file://src/services/PrivacyGateController.js)
- [src/services/DocumentAnalysisEngine.js](file://src/services/DocumentAnalysisEngine.js)
- [src/services/AutomationRuleProcessor.js](file://src/services/AutomationRuleProcessor.js)
- [src/services/TemplateManager.js](file://src/services/TemplateManager.js)
- [src/services/RedactionService.js](file://src/services/RedactionService.js)
- [src/Main.js](file://src/Main.js)
- [src/ui/Sidebar.html](file://src/ui/Sidebar.html)
- [src/appsscript.json](file://src/appsscript.json)
- [src/utils/Utils.js](file://src/utils/Utils.js)
- [README.md](file://README.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Service Components](#service-components)
4. [Google Apps Script Terms](#google-apps-script-terms)
5. [Privacy and Security Terms](#privacy-and-security-terms)
6. [Document Processing Terms](#document-processing-terms)
7. [Acronyms and Abbreviations](#acronyms-and-abbreviations)
8. [Technical Infrastructure](#technical-infrastructure)
9. [User Interface Concepts](#user-interface-concepts)
10. [Cross-References](#cross-references)

## Introduction

This glossary provides comprehensive definitions of key terms, concepts, and technologies used throughout the Intelligent Document Automation Google Workspace add-on. The glossary is organized alphabetically with cross-references to related concepts and actual implementations in the source code.

## Core Concepts

### Document Analysis Engine
The Document Analysis Engine is a comprehensive system that detects formatting issues, duplicates, anomalies, and provides actionable suggestions for document improvement. It operates across multiple Google Workspace applications including Documents, Spreadsheets, and Presentations.

**Key Features:**
- Multi-platform document analysis (Documents, Sheets, Slides)
- Automatic issue detection and categorization
- Actionable suggestions for improvement
- Real-time analysis with performance optimization

**Implementation:** [DocumentAnalysisEngine.js](file://src/services/DocumentAnalysisEngine.js#L1-L739)

### PrivacyGateController
The PrivacyGateController manages user consent and enforces privacy policies for data processing. It implements a comprehensive privacy framework that ensures user data protection and compliance with privacy regulations.

**Core Functions:**
- Consent management for different feature categories
- Privacy policy enforcement
- Data processing validation
- Audit logging and event tracking

**Consent Types:**
- **Basic**: Core functionality without data processing
- **Advanced AI**: AI-powered features requiring data transmission
- **Redaction**: Sensitive data removal capabilities
- **Analytics**: Usage statistics collection
- **Template Sharing**: Access to shared template libraries

**Implementation:** [PrivacyGateController.js](file://src/services/PrivacyGateController.js#L1-L366)

### AutomationRuleProcessor
The AutomationRuleProcessor executes macro-like operations for batch transformations and cleanup tasks. It provides intelligent data cleaning and formatting capabilities for spreadsheets.

**Supported Operations:**
- Duplicate row removal
- Date format standardization
- Empty cell filling
- Whitespace trimming
- Text capitalization
- Currency format standardization

**Implementation:** [AutomationRuleProcessor.js](file://src/services/AutomationRuleProcessor.js#L1-L399)

### TemplateManager
The TemplateManager handles document templates with Drive picker integration and preview functionality. It provides access to both built-in and custom templates for rapid document creation.

**Template Categories:**
- Education: Grading rubrics, academic templates
- Business: Professional documents, sales reports
- Legal: Contracts, legal templates
- Sales: Reporting templates, CRM integration

**Implementation:** [TemplateManager.js](file://src/services/TemplateManager.js#L1-L479)

### RedactionService
The RedactionService detects and redacts PII (Personally Identifiable Information) and sensitive information from documents using sophisticated pattern matching and regular expressions.

**PII Detection Patterns:**
- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers
- IP addresses
- Dates of birth
- ZIP codes

**Implementation:** [RedactionService.js](file://src/services/RedactionService.js#L1-L402)

## Google Apps Script Terms

### HtmlService
HtmlService is a Google Apps Script service that enables the creation of web pages and user interfaces within Google Workspace applications. It allows embedding HTML content with JavaScript and server-side Google Apps Script functions.

**Key Capabilities:**
- Dynamic HTML generation
- Client-server communication via google.script.run
- Modal dialogs and sidebars
- Responsive UI components

**Usage Example:** [Sidebar.html](file://src/ui/Sidebar.html#L1-L493)

### CardService
CardService is used to create interactive cards and modals within Google Workspace add-ons. It provides a structured way to present information and collect user input through modern UI components.

**Components:**
- Cards with sections and widgets
- Navigation systems
- Interactive elements
- Responsive layouts

**Implementation:** [Main.js](file://src/Main.js#L235-L266)

### PropertiesService
PropertiesService manages persistent storage of application data. It provides different storage scopes including user properties, script properties, and document properties.

**Storage Types:**
- **User Properties**: Per-user settings and preferences
- **Script Properties**: Global application settings
- **Document Properties**: Document-specific metadata

**Implementation:** [PrivacyGateController.js](file://src/services/PrivacyGateController.js#L23-L24)

### OAuth Scopes
OAuth Scopes define the permissions requested by the add-on for accessing Google Workspace APIs and user data.

**Required Scopes:**
- `documents.currentonly`: Access to current Google Document
- `spreadsheets.currentonly`: Access to current Google Spreadsheet
- `presentations.currentonly`: Access to current Google Presentation
- `drive.file`: Access to files created by the add-on
- `script.container.ui`: Display UI elements within Google apps
- `userinfo.email`: Access to user email address

**Implementation:** [appsscript.json](file://src/appsscript.json#L29-L36)

## Privacy and Security Terms

### PII (Personally Identifiable Information)
PII refers to any information that can be used to identify an individual. The system implements comprehensive PII detection and redaction capabilities.

**Detection Categories:**
- **Contact Information**: Email addresses, phone numbers
- **Financial Data**: Credit card numbers, bank account details
- **Government IDs**: Social Security Numbers, Passport numbers
- **Location Data**: IP addresses, ZIP codes
- **Personal Identifiers**: Names, dates of birth

### Privacy Consent Model
The add-on implements a granular consent model where users explicitly authorize specific features before data processing occurs.

**Consent Levels:**
- **Basic Features**: Always enabled, local processing only
- **Advanced Features**: Require explicit consent
- **Data Transmission**: Requires separate consent for external processing

### Local Processing
All core functionality operates locally within Google Apps Script by default, ensuring data never leaves Google's infrastructure unless explicitly consented.

## Document Processing Terms

### Document Type Detection
The system automatically identifies the type of Google Workspace document currently being processed.

**Supported Types:**
- **DOCUMENT**: Google Docs
- **SPREADSHEET**: Google Sheets
- **PRESENTATION**: Google Slides
- **UNKNOWN**: Unsupported or unrecognized formats

### Formatting Analysis
Comprehensive analysis of document formatting including:
- Heading consistency
- Spacing and punctuation
- Font usage
- List formatting
- Text structure

### Batch Processing
Large-scale operations are handled through intelligent batching to avoid quota limits and timeouts.

**Batch Strategies:**
- Chunked data processing
- Progress indicators
- Error recovery mechanisms
- Rate limiting

## Acronyms and Abbreviations

### AI
**Artificial Intelligence**: Machine learning capabilities for advanced document processing, summarization, and formatting. Requires explicit user consent for data transmission.

### PII
**Personally Identifiable Information**: Sensitive personal data that requires protection and redaction.

### UI
**User Interface**: The visual and interactive elements that users engage with when using the add-on.

### API
**Application Programming Interface**: Interfaces that enable communication between different software components.

### SDK
**Software Development Kit**: Tools and libraries for developing applications.

### V8
**JavaScript Runtime**: The high-performance JavaScript engine used by Google Apps Script.

### OAuth
**Open Authorization**: Protocol for secure API access and authentication.

### MIME
**Multipurpose Internet Mail Extensions**: File type identification system used for document classification.

## Technical Infrastructure

### Google Apps Script Runtime
The add-on runs on Google Apps Script platform with V8 runtime for optimal performance.

**Features:**
- Serverless execution environment
- Integrated Google Workspace APIs
- Automatic scaling
- Built-in security sandbox

### Cloud Services Integration
Limited integration with external services for advanced features, always under user consent.

**Services:**
- Ollama AI backend for advanced processing
- Google Drive for template storage
- Stackdriver for error logging

### Quota Management
The system implements intelligent quota management to handle Google Apps Script limitations.

**Quota Areas:**
- Execution time limits
- API call limits
- Storage limits
- Rate limiting

## User Interface Concepts

### Sidebar Interface
The primary user interface is a persistent sidebar that provides access to all add-on features.

**Sections:**
- **Analyze**: Document analysis and issue detection
- **Redact**: PII detection and redaction
- **Clean**: Data cleanup and formatting
- **Templates**: Template browsing and application

### Modal Dialogs
Interactive modal dialogs for specific operations like template selection and settings configuration.

### Progressive Disclosure
Information is presented progressively, showing basic features first and advanced options upon request.

## Cross-References

### Related Components
- **PrivacyGateController** ↔ **RedactionService**: Consent management for PII processing
- **DocumentAnalysisEngine** ↔ **AutomationRuleProcessor**: Complementary document enhancement tools
- **TemplateManager** ↔ **PrivacyGateController**: Template sharing requires consent
- **HtmlService** ↔ **CardService**: UI frameworks for different interaction patterns

### Feature Dependencies
- Advanced AI features require **PrivacyGateController** consent
- Template operations depend on **TemplateManager** and **DriveApp** services
- Document analysis integrates with **DocumentApp**, **SpreadsheetApp**, and **SlidesApp**
- Redaction operations utilize **RedactionService** with pattern matching

### Data Flow
1. **User Interaction** → UI Components (HtmlService/CardService)
2. **Validation** → PrivacyGateController
3. **Processing** → DocumentAnalysisEngine/AutomationRuleProcessor
4. **Storage** → PropertiesService
5. **External Services** → OAuth Authentication

**Section sources**
- [src/services/PrivacyGateController.js](file://src/services/PrivacyGateController.js#L1-L366)
- [src/services/DocumentAnalysisEngine.js](file://src/services/DocumentAnalysisEngine.js#L1-L739)
- [src/services/AutomationRuleProcessor.js](file://src/services/AutomationRuleProcessor.js#L1-L399)
- [src/services/TemplateManager.js](file://src/services/TemplateManager.js#L1-L479)
- [src/services/RedactionService.js](file://src/services/RedactionService.js#L1-L402)
- [src/Main.js](file://src/Main.js#L1-L800)
- [src/ui/Sidebar.html](file://src/ui/Sidebar.html#L1-L493)
- [src/appsscript.json](file://src/appsscript.json#L1-L47)
- [src/utils/Utils.js](file://src/utils/Utils.js#L1-L258)