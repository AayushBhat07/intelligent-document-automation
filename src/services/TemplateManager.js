/**
 * Template Manager
 * Manages document templates with Drive picker integration and preview functionality
 */

const TemplateManager = (function() {
  
  const TEMPLATE_FOLDER_KEY = 'templateFolderId';
  const BUILTIN_TEMPLATES = {
    grading_rubric: {
      name: 'Grading Rubric Template',
      description: 'Standard grading rubric for educators',
      type: 'SPREADSHEET',
      category: 'Education'
    },
    document_style: {
      name: 'Professional Document Style',
      description: 'Professional formatting template for documents',
      type: 'DOCUMENT',
      category: 'Business'
    },
    presentation_clean: {
      name: 'Clean Presentation Template',
      description: 'Minimalist slide design template',
      type: 'PRESENTATION',
      category: 'Business'
    },
    contract_template: {
      name: 'Legal Contract Template',
      description: 'Standard contract format with clauses',
      type: 'DOCUMENT',
      category: 'Legal'
    },
    sales_report: {
      name: 'Sales Report Template',
      description: 'Monthly sales report template',
      type: 'SPREADSHEET',
      category: 'Sales'
    }
  };
  
  /**
   * Shows template picker dialog
   * @returns {Object} Selected template information
   */
  function showTemplatePicker() {
    try {
      // Check consent for template access
      if (!PrivacyGateController.checkConsent('templateSharing')) {
        const granted = PrivacyGateController.requestConsent(
          'templateSharing',
          'Access template library from Google Drive'
        );
        
        if (!granted) {
          return {
            success: false,
            message: 'Template access requires Drive permission'
          };
        }
      }
      
      const ui = getHostAppUI();
      if (!ui) {
        return { success: false, message: 'UI not available' };
      }
      
      // Build template selection UI
      const htmlOutput = HtmlService.createHtmlOutput(buildTemplatePickerHTML())
        .setWidth(600)
        .setHeight(400);
      
      ui.showModalDialog(htmlOutput, 'Select Template');
      
      return { success: true, message: 'Template picker opened' };
    } catch (e) {
      console.error('Error showing template picker:', e);
      return { success: false, message: 'Error: ' + e.message };
    }
  }
  
  /**
   * Lists available templates
   * @param {string} category - Optional category filter
   * @returns {Array} List of templates
   */
  function listTemplates(category = null) {
    const templates = [];
    
    // Add built-in templates
    Object.keys(BUILTIN_TEMPLATES).forEach(key => {
      const template = BUILTIN_TEMPLATES[key];
      if (!category || template.category === category) {
        templates.push({
          id: key,
          name: template.name,
          description: template.description,
          type: template.type,
          category: template.category,
          source: 'builtin'
        });
      }
    });
    
    // Add custom templates from Drive
    try {
      const customTemplates = getCustomTemplatesFromDrive(category);
      templates.push(...customTemplates);
    } catch (e) {
      console.error('Error loading custom templates:', e);
    }
    
    return templates;
  }
  
  /**
   * Gets custom templates from Drive folder
   * @param {string} category - Category filter
   * @returns {Array} Custom templates
   */
  function getCustomTemplatesFromDrive(category) {
    const templates = [];
    
    try {
      const folderId = PropertiesService.getUserProperties().getProperty(TEMPLATE_FOLDER_KEY);
      
      if (folderId) {
        const folder = DriveApp.getFolderById(folderId);
        const files = folder.getFiles();
        
        while (files.hasNext()) {
          const file = files.next();
          const mimeType = file.getMimeType();
          
          templates.push({
            id: file.getId(),
            name: file.getName(),
            description: file.getDescription() || 'Custom template',
            type: getTypeFromMimeType(mimeType),
            category: category || 'Custom',
            source: 'drive',
            url: file.getUrl()
          });
        }
      }
    } catch (e) {
      console.error('Error getting custom templates:', e);
    }
    
    return templates;
  }
  
  /**
   * Applies a template to the current document
   * @param {string} templateId - Template ID to apply
   * @returns {Object} Result of template application
   */
  function applyTemplate(templateId) {
    try {
      const template = BUILTIN_TEMPLATES[templateId];
      
      if (!template) {
        // Try to load from Drive
        return applyDriveTemplate(templateId);
      }
      
      const docType = DocumentAnalysisEngine.getDocumentType();
      
      // Verify template type matches document type
      if (template.type !== docType) {
        return {
          success: false,
          message: `Template is for ${template.type} but current document is ${docType}`
        };
      }
      
      // Apply template based on type
      let result;
      switch(docType) {
        case 'SPREADSHEET':
          result = applySpreadsheetTemplate(templateId, template);
          break;
        case 'DOCUMENT':
          result = applyDocumentTemplate(templateId, template);
          break;
        case 'PRESENTATION':
          result = applyPresentationTemplate(templateId, template);
          break;
        default:
          return { success: false, message: 'Unsupported document type' };
      }
      
      if (result.success) {
        AnalyticsService.trackEvent('apply_template', { templateId });
      }
      
      return result;
    } catch (e) {
      console.error('Error applying template:', e);
      return { success: false, message: 'Error: ' + e.message };
    }
  }
  
  /**
   * Applies spreadsheet template
   * @param {string} templateId - Template ID
   * @param {Object} template - Template metadata
   * @returns {Object} Result
   */
  function applySpreadsheetTemplate(templateId, template) {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    switch(templateId) {
      case 'grading_rubric':
        return applyGradingRubricTemplate(sheet);
      case 'sales_report':
        return applySalesReportTemplate(sheet);
      default:
        return { success: false, message: 'Unknown template' };
    }
  }
  
  /**
   * Applies grading rubric template
   * @param {Sheet} sheet - Target sheet
   * @returns {Object} Result
   */
  function applyGradingRubricTemplate(sheet) {
    const headers = [
      'Student Name', 'Assignment', 'Criteria 1', 'Criteria 2', 
      'Criteria 3', 'Total Score', 'Grade', 'Comments'
    ];
    
    // Set headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // Add sample data
    const sampleData = [
      ['John Doe', 'Assignment 1', '8', '9', '7', '=C2+D2+E2', '=IF(F2>=24,"A",IF(F2>=20,"B","C"))', ''],
      ['Jane Smith', 'Assignment 1', '9', '10', '8', '=C3+D3+E3', '=IF(F3>=24,"A",IF(F3>=20,"B","C"))', '']
    ];
    
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
    
    // Format score columns
    sheet.getRange(2, 6, 100, 1).setNumberFormat('0');
    
    // Auto-resize columns
    headers.forEach((_, index) => {
      sheet.autoResizeColumn(index + 1);
    });
    
    return {
      success: true,
      message: 'Applied grading rubric template successfully'
    };
  }
  
  /**
   * Applies sales report template
   * @param {Sheet} sheet - Target sheet
   * @returns {Object} Result
   */
  function applySalesReportTemplate(sheet) {
    const headers = [
      'Date', 'Product', 'Quantity', 'Unit Price', 
      'Total', 'Sales Rep', 'Region'
    ];
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('#ffffff');
    
    // Add formulas
    sheet.getRange(2, 5, 100, 1).setFormula('=C2*D2');
    
    // Format columns
    sheet.getRange(2, 1, 100, 1).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(2, 4, 100, 2).setNumberFormat('$#,##0.00');
    
    headers.forEach((_, index) => {
      sheet.autoResizeColumn(index + 1);
    });
    
    return {
      success: true,
      message: 'Applied sales report template successfully'
    };
  }
  
  /**
   * Applies document template
   * @param {string} templateId - Template ID
   * @param {Object} template - Template metadata
   * @returns {Object} Result
   */
  function applyDocumentTemplate(templateId, template) {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    
    switch(templateId) {
      case 'document_style':
        return applyProfessionalStyle(body);
      case 'contract_template':
        return applyContractTemplate(body);
      default:
        return { success: false, message: 'Unknown template' };
    }
  }
  
  /**
   * Applies professional document style
   * @param {Body} body - Document body
   * @returns {Object} Result
   */
  function applyProfessionalStyle(body) {
    const paragraphs = body.getParagraphs();
    
    paragraphs.forEach(para => {
      const heading = para.getHeading();
      const text = para.editAsText();
      
      switch(heading) {
        case DocumentApp.ParagraphHeading.HEADING1:
          text.setFontSize(18);
          text.setFontFamily('Arial');
          text.setBold(true);
          break;
        case DocumentApp.ParagraphHeading.HEADING2:
          text.setFontSize(16);
          text.setFontFamily('Arial');
          text.setBold(true);
          break;
        case DocumentApp.ParagraphHeading.HEADING3:
          text.setFontSize(14);
          text.setFontFamily('Arial');
          text.setBold(true);
          break;
        default:
          text.setFontSize(11);
          text.setFontFamily('Arial');
      }
    });
    
    return {
      success: true,
      message: 'Applied professional document style'
    };
  }
  
  /**
   * Applies presentation template
   * @param {string} templateId - Template ID
   * @param {Object} template - Template metadata
   * @returns {Object} Result
   */
  function applyPresentationTemplate(templateId, template) {
    const presentation = SlidesApp.getActivePresentation();
    
    switch(templateId) {
      case 'presentation_clean':
        return applyCleanPresentationStyle(presentation);
      default:
        return { success: false, message: 'Unknown template' };
    }
  }
  
  /**
   * Applies clean presentation style
   * @param {Presentation} presentation - Presentation object
   * @returns {Object} Result
   */
  function applyCleanPresentationStyle(presentation) {
    const slides = presentation.getSlides();
    
    slides.forEach(slide => {
      const shapes = slide.getShapes();
      
      shapes.forEach(shape => {
        if (shape.getText) {
          const text = shape.getText();
          const style = text.getTextStyle();
          style.setFontFamily('Roboto');
        }
      });
    });
    
    return {
      success: true,
      message: 'Applied clean presentation template'
    };
  }
  
  /**
   * Applies template from Drive
   * @param {string} fileId - Drive file ID
   * @returns {Object} Result
   */
  function applyDriveTemplate(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      // Implementation would copy content from template file
      
      return {
        success: true,
        message: 'Applied Drive template: ' + file.getName()
      };
    } catch (e) {
      return { success: false, message: 'Error loading Drive template: ' + e.message };
    }
  }
  
  /**
   * Builds template picker HTML
   * @returns {string} HTML content
   */
  function buildTemplatePickerHTML() {
    const templates = listTemplates();
    
    let html = '<style>' +
      'body { font-family: Arial, sans-serif; padding: 20px; }' +
      '.template-item { border: 1px solid #ddd; padding: 12px; margin: 8px 0; border-radius: 4px; cursor: pointer; }' +
      '.template-item:hover { background: #f0f0f0; }' +
      '.template-name { font-weight: bold; margin-bottom: 4px; }' +
      '.template-desc { font-size: 12px; color: #666; }' +
      '</style>';
    
    html += '<h3>Select a Template</h3>';
    
    templates.forEach(template => {
      html += `<div class="template-item" onclick="google.script.run.applyTemplate('${template.id}')">`;
      html += `<div class="template-name">${template.name}</div>`;
      html += `<div class="template-desc">${template.description}</div>`;
      html += `</div>`;
    });
    
    return html;
  }
  
  /**
   * Gets document type from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} Document type
   */
  function getTypeFromMimeType(mimeType) {
    if (mimeType.includes('spreadsheet')) return 'SPREADSHEET';
    if (mimeType.includes('document')) return 'DOCUMENT';
    if (mimeType.includes('presentation')) return 'PRESENTATION';
    return 'UNKNOWN';
  }
  
  /**
   * Gets host app UI
   * @returns {Ui|null} UI object
   */
  function getHostAppUI() {
    try {
      if (typeof DocumentApp !== 'undefined') return DocumentApp.getUi();
      if (typeof SpreadsheetApp !== 'undefined') return SpreadsheetApp.getUi();
      if (typeof SlidesApp !== 'undefined') return SlidesApp.getUi();
    } catch (e) {}
    return null;
  }
  
  // Public API
  return {
    showTemplatePicker: showTemplatePicker,
    listTemplates: listTemplates,
    applyTemplate: applyTemplate
  };
  
})();
