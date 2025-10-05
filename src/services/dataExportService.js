/**
 * Data Export Service
 * Handles data export in various formats (CSV, PDF, JSON, Excel)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export Formats
 */
export const EXPORT_FORMATS = {
  CSV: {
    id: 'csv',
    name: 'CSV',
    icon: '📊',
    description: 'Comma-separated values file',
    mimeType: 'text/csv'
  },
  PDF: {
    id: 'pdf',
    name: 'PDF Report',
    icon: '📄',
    description: 'Formatted PDF report',
    mimeType: 'application/pdf'
  },
  JSON: {
    id: 'json',
    name: 'JSON',
    icon: '🔧',
    description: 'JavaScript Object Notation',
    mimeType: 'application/json'
  },
  EXCEL: {
    id: 'excel',
    name: 'Excel',
    icon: '📈',
    description: 'Microsoft Excel format',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
};

/**
 * Report Types
 */
export const REPORT_TYPES = {
  DEVICE_SUMMARY: {
    id: 'device_summary',
    name: 'Device Summary Report',
    description: 'Overview of all devices and their status'
  },
  SENSOR_DATA: {
    id: 'sensor_data',
    name: 'Sensor Data Report',
    description: 'Detailed sensor readings and analytics'
  },
  ALERT_HISTORY: {
    id: 'alert_history',
    name: 'Alert History Report',
    description: 'Complete history of alerts and notifications'
  },
  MAINTENANCE_SCHEDULE: {
    id: 'maintenance_schedule',
    name: 'Maintenance Schedule',
    description: 'Upcoming and past maintenance activities'
  },
  PERFORMANCE_ANALYSIS: {
    id: 'performance_analysis',
    name: 'Performance Analysis',
    description: 'Device performance metrics and trends'
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Report',
    description: 'User-defined data export'
  }
};

/**
 * Data Export Manager Class
 */
class DataExportManager {
  constructor() {
    this.exportHistory = [];
    this.exportTemplates = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize export templates
   */
  initializeTemplates() {
    // Device Summary Template
    this.exportTemplates.set(REPORT_TYPES.DEVICE_SUMMARY.id, {
      columns: [
        { key: 'name', title: 'Device Name', width: 150 },
        { key: 'type', title: 'Device Type', width: 120 },
        { key: 'status', title: 'Status', width: 80 },
        { key: 'location', title: 'Location', width: 120 },
        { key: 'lastSeen', title: 'Last Seen', width: 120 },
        { key: 'batteryLevel', title: 'Battery %', width: 80 },
        { key: 'signalStrength', title: 'Signal (dBm)', width: 100 }
      ],
      dataTransform: this.transformDeviceData.bind(this)
    });

    // Sensor Data Template
    this.exportTemplates.set(REPORT_TYPES.SENSOR_DATA.id, {
      columns: [
        { key: 'deviceName', title: 'Device', width: 120 },
        { key: 'sensorType', title: 'Sensor', width: 100 },
        { key: 'value', title: 'Value', width: 80 },
        { key: 'unit', title: 'Unit', width: 60 },
        { key: 'timestamp', title: 'Timestamp', width: 140 },
        { key: 'quality', title: 'Quality', width: 80 }
      ],
      dataTransform: this.transformSensorData.bind(this)
    });
  }

  /**
   * Export data in specified format
   */
  async exportData(reportType, format, data, options = {}) {
    const exportId = this.generateExportId();
    const startTime = Date.now();

    try {
      let result;
      
      switch (format.id) {
        case 'csv':
          result = await this.exportToCSV(reportType, data, options);
          break;
        case 'pdf':
          result = await this.exportToPDF(reportType, data, options);
          break;
        case 'json':
          result = await this.exportToJSON(reportType, data, options);
          break;
        case 'excel':
          result = await this.exportToExcel(reportType, data, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format.id}`);
      }

      // Record export history
      this.recordExport({
        id: exportId,
        reportType,
        format,
        recordCount: data.length,
        fileSize: result.size,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      return result;

    } catch (error) {
      // Record failed export
      this.recordExport({
        id: exportId,
        reportType,
        format,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Export to CSV format
   */
  async exportToCSV(reportType, data, options) {
    const template = this.exportTemplates.get(reportType.id);
    if (!template) throw new Error(`No template found for report type: ${reportType.id}`);

    const transformedData = template.dataTransform(data);
    const headers = template.columns.map(col => col.title);
    const rows = transformedData.map(row => 
      template.columns.map(col => row[col.key] || '')
    );

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${reportType.name.replace(/\s+/g, '_')}_${this.getTimestamp()}.csv`;
    
    return this.downloadFile(blob, filename);
  }

  /**
   * Export to PDF format
   */
  async exportToPDF(reportType, data, options) {
    const template = this.exportTemplates.get(reportType.id);
    if (!template) throw new Error(`No template found for report type: ${reportType.id}`);

    const transformedData = template.dataTransform(data);
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text(reportType.name, 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Records: ${transformedData.length}`, 14, 35);
    
    // Add table
    const tableData = transformedData.map(row => 
      template.columns.map(col => row[col.key] || '')
    );
    
    autoTable(doc, {
      head: [template.columns.map(col => col.title)],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 139, 34] }
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, 
                doc.internal.pageSize.height - 10);
    }

    // Generate filename and save
    const filename = `${reportType.name.replace(/\s+/g, '_')}_${this.getTimestamp()}.pdf`;
    doc.save(filename);

    return {
      filename,
      size: doc.output('blob').size,
      type: 'application/pdf'
    };
  }

  /**
   * Export to JSON format
   */
  async exportToJSON(reportType, data, options) {
    const transformedData = this.transformDataForJSON(data);
    
    const jsonContent = {
      metadata: {
        reportType: reportType.name,
        generatedAt: new Date().toISOString(),
        recordCount: transformedData.length,
        version: '1.0'
      },
      data: transformedData
    };

    const jsonString = JSON.stringify(jsonContent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `${reportType.name.replace(/\s+/g, '_')}_${this.getTimestamp()}.json`;
    
    return this.downloadFile(blob, filename);
  }

  /**
   * Export to Excel format (simulated)
   */
  async exportToExcel(reportType, data, options) {
    // In a real implementation, you would use a library like SheetJS
    // For now, we'll create a CSV that can be opened in Excel
    const csvResult = await this.exportToCSV(reportType, data, options);
    
    return {
      ...csvResult,
      filename: csvResult.filename.replace('.csv', '.xlsx'),
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  /**
   * Transform device data for export
   */
  transformDeviceData(devices) {
    return devices.map(device => ({
      name: device.name,
      type: device.type,
      status: device.status,
      location: `${device.location?.lat?.toFixed(4)}, ${device.location?.lon?.toFixed(4)}`,
      lastSeen: new Date(device.lastSeen).toLocaleString(),
      batteryLevel: device.health?.metrics?.battery_level?.value || 'N/A',
      signalStrength: device.health?.metrics?.signal_strength?.value || 'N/A'
    }));
  }

  /**
   * Transform sensor data for export
   */
  transformSensorData(sensorData) {
    const transformed = [];
    
    Object.entries(sensorData).forEach(([deviceId, data]) => {
      if (data.sensors) {
        Object.entries(data.sensors).forEach(([sensorType, sensorValue]) => {
          transformed.push({
            deviceName: data.deviceName || deviceId,
            sensorType: sensorType.replace('_', ' '),
            value: sensorValue.value,
            unit: sensorValue.unit,
            timestamp: new Date(data.timestamp).toLocaleString(),
            quality: data.quality || 'good'
          });
        });
      }
    });

    return transformed;
  }

  /**
   * Transform data for JSON export
   */
  transformDataForJSON(data) {
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        exportedAt: new Date().toISOString()
      }));
    }
    
    return {
      ...data,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Download file to user's device
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      filename,
      size: blob.size,
      type: blob.type
    };
  }

  /**
   * Generate export ID
   */
  generateExportId() {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get timestamp for filename
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  /**
   * Record export in history
   */
  recordExport(exportRecord) {
    this.exportHistory.unshift(exportRecord);
    
    // Keep only last 100 exports
    if (this.exportHistory.length > 100) {
      this.exportHistory = this.exportHistory.slice(0, 100);
    }
  }

  /**
   * Get export history
   */
  getExportHistory() {
    return this.exportHistory;
  }

  /**
   * Get export statistics
   */
  getExportStatistics() {
    const total = this.exportHistory.length;
    const successful = this.exportHistory.filter(e => e.status === 'success').length;
    const failed = total - successful;
    
    const formatCounts = this.exportHistory.reduce((acc, export_) => {
      acc[export_.format.id] = (acc[export_.format.id] || 0) + 1;
      return acc;
    }, {});

    const reportTypeCounts = this.exportHistory.reduce((acc, export_) => {
      acc[export_.reportType.id] = (acc[export_.reportType.id] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      formatCounts,
      reportTypeCounts,
      averageFileSize: successful > 0 ? 
        this.exportHistory
          .filter(e => e.status === 'success' && e.fileSize)
          .reduce((sum, e) => sum + e.fileSize, 0) / successful : 0
    };
  }

  /**
   * Create custom report template
   */
  createCustomTemplate(templateId, columns, dataTransform) {
    this.exportTemplates.set(templateId, {
      columns,
      dataTransform
    });
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.exportTemplates.keys()).map(id => ({
      id,
      ...REPORT_TYPES[id]
    }));
  }
}

// Create global export manager instance
export const dataExportManager = new DataExportManager();

// Export convenience functions
export async function exportData(reportType, format, data, options) {
  return dataExportManager.exportData(reportType, format, data, options);
}

export function getExportHistory() {
  return dataExportManager.getExportHistory();
}

export function getExportStatistics() {
  return dataExportManager.getExportStatistics();
}

export function createCustomTemplate(templateId, columns, dataTransform) {
  return dataExportManager.createCustomTemplate(templateId, columns, dataTransform);
}

export function getAvailableTemplates() {
  return dataExportManager.getAvailableTemplates();
}
