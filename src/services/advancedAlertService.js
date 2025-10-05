/**
 * Advanced Alert Service
 * Handles email, SMS, and push notifications for critical alerts
 */

/**
 * Alert Severity Levels
 */
export const ALERT_SEVERITY = {
  CRITICAL: {
    level: 1,
    name: 'Critical',
    color: 'red',
    icon: '🚨',
    requiresImmediateAction: true,
    notificationChannels: ['email', 'sms', 'push']
  },
  HIGH: {
    level: 2,
    name: 'High',
    color: 'orange',
    icon: '⚠️',
    requiresImmediateAction: false,
    notificationChannels: ['email', 'push']
  },
  MEDIUM: {
    level: 3,
    name: 'Medium',
    color: 'yellow',
    icon: '⚡',
    requiresImmediateAction: false,
    notificationChannels: ['push']
  },
  LOW: {
    level: 4,
    name: 'Low',
    color: 'blue',
    icon: 'ℹ️',
    requiresImmediateAction: false,
    notificationChannels: ['push']
  }
};

/**
 * Notification Channels
 */
export const NOTIFICATION_CHANNELS = {
  EMAIL: {
    id: 'email',
    name: 'Email',
    icon: '📧',
    enabled: true,
    maxFrequency: 'immediate' // immediate, hourly, daily
  },
  SMS: {
    id: 'sms',
    name: 'SMS',
    icon: '📱',
    enabled: true,
    maxFrequency: 'hourly'
  },
  PUSH: {
    id: 'push',
    name: 'Push Notification',
    icon: '🔔',
    enabled: true,
    maxFrequency: 'immediate'
  },
  WEBHOOK: {
    id: 'webhook',
    name: 'Webhook',
    icon: '🔗',
    enabled: false,
    maxFrequency: 'immediate'
  }
};

/**
 * Alert Templates
 */
export const ALERT_TEMPLATES = {
  DEVICE_OFFLINE: {
    id: 'device_offline',
    title: 'Device Offline Alert',
    emailSubject: '🚨 Critical: {deviceName} is Offline',
    emailBody: `
      <h2>Device Offline Alert</h2>
      <p><strong>Device:</strong> {deviceName}</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Last Seen:</strong> {lastSeen}</p>
      <p><strong>Duration Offline:</strong> {duration}</p>
      <p>Please check the device and restore connectivity as soon as possible.</p>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    smsBody: 'ALERT: {deviceName} offline for {duration}. Check immediately.',
    pushTitle: 'Device Offline',
    pushBody: '{deviceName} has been offline for {duration}'
  },
  
  SENSOR_THRESHOLD: {
    id: 'sensor_threshold',
    title: 'Sensor Threshold Alert',
    emailSubject: '⚠️ {severity}: {sensorName} Threshold Exceeded',
    emailBody: `
      <h2>Sensor Threshold Alert</h2>
      <p><strong>Device:</strong> {deviceName}</p>
      <p><strong>Sensor:</strong> {sensorName}</p>
      <p><strong>Current Value:</strong> {currentValue} {unit}</p>
      <p><strong>Threshold:</strong> {threshold} {unit}</p>
      <p><strong>Condition:</strong> {condition}</p>
      <p><strong>Severity:</strong> {severity}</p>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    smsBody: '{severity} ALERT: {deviceName} {sensorName} {condition} {threshold} (current: {currentValue})',
    pushTitle: 'Sensor Alert',
    pushBody: '{deviceName} {sensorName}: {currentValue} {condition} {threshold}'
  },
  
  IRRIGATION_FAILED: {
    id: 'irrigation_failed',
    title: 'Irrigation System Failure',
    emailSubject: '🚨 Critical: Irrigation System Failure',
    emailBody: `
      <h2>Irrigation System Failure</h2>
      <p><strong>Device:</strong> {deviceName}</p>
      <p><strong>Error:</strong> {errorMessage}</p>
      <p><strong>Duration:</strong> {duration}</p>
      <p><strong>Impact:</strong> {impact}</p>
      <p>Immediate attention required to prevent crop damage.</p>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    smsBody: 'CRITICAL: Irrigation failure on {deviceName}. Check immediately.',
    pushTitle: 'Irrigation Failure',
    pushBody: 'Irrigation system failure on {deviceName}'
  },
  
  WEATHER_ALERT: {
    id: 'weather_alert',
    title: 'Weather Alert',
    emailSubject: '🌤️ Weather Alert: {alertType}',
    emailBody: `
      <h2>Weather Alert</h2>
      <p><strong>Alert Type:</strong> {alertType}</p>
      <p><strong>Severity:</strong> {severity}</p>
      <p><strong>Expected Impact:</strong> {impact}</p>
      <p><strong>Duration:</strong> {duration}</p>
      <p><strong>Recommendations:</strong> {recommendations}</p>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    smsBody: 'Weather Alert: {alertType} - {severity}. {recommendations}',
    pushTitle: 'Weather Alert',
    pushBody: '{alertType}: {severity} - {impact}'
  },
  
  SYSTEM_ERROR: {
    id: 'system_error',
    title: 'System Error',
    emailSubject: '🔧 System Error: {errorType}',
    emailBody: `
      <h2>System Error</h2>
      <p><strong>Error Type:</strong> {errorType}</p>
      <p><strong>Component:</strong> {component}</p>
      <p><strong>Message:</strong> {message}</p>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    smsBody: 'System Error: {errorType} in {component}',
    pushTitle: 'System Error',
    pushBody: '{errorType} in {component}'
  }
};

/**
 * Alert Manager Class
 */
class AlertManager {
  constructor() {
    this.alerts = [];
    this.subscribers = [];
    this.notificationSettings = {
      email: { enabled: true, address: 'admin@farm.com' },
      sms: { enabled: true, number: '+1234567890' },
      push: { enabled: true },
      webhook: { enabled: false, url: '' }
    };
    this.rateLimits = new Map();
  }

  /**
   * Create a new alert
   */
  createAlert(alertData) {
    const alert = {
      id: this.generateAlertId(),
      ...alertData,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      notifications: []
    };

    this.alerts.unshift(alert);
    this.processAlert(alert);
    this.notifySubscribers(alert);

    return alert;
  }

  /**
   * Process alert and send notifications
   */
  async processAlert(alert) {
    const severity = ALERT_SEVERITY[alert.severity] || ALERT_SEVERITY.MEDIUM;
    
    // Check rate limiting
    if (this.isRateLimited(alert)) {
      console.log(`Alert ${alert.id} rate limited`);
      return;
    }

    // Send notifications based on severity
    for (const channel of severity.notificationChannels) {
      if (this.notificationSettings[channel]?.enabled) {
        await this.sendNotification(alert, channel);
      }
    }

    // Update rate limiting
    this.updateRateLimit(alert);
  }

  /**
   * Send notification through specified channel
   */
  async sendNotification(alert, channel) {
    try {
      const template = ALERT_TEMPLATES[alert.template] || ALERT_TEMPLATES.SENSOR_THRESHOLD;
      const message = this.formatMessage(template, alert, channel);

      switch (channel) {
        case 'email':
          await this.sendEmail(alert, message);
          break;
        case 'sms':
          await this.sendSMS(alert, message);
          break;
        case 'push':
          await this.sendPushNotification(alert, message);
          break;
        case 'webhook':
          await this.sendWebhook(alert, message);
          break;
      }

      // Record notification
      alert.notifications.push({
        channel,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });

    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
      alert.notifications.push({
        channel,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Format message using template
   */
  formatMessage(template, alert, channel) {
    let message = '';
    
    switch (channel) {
      case 'email':
        message = {
          subject: this.replacePlaceholders(template.emailSubject, alert),
          body: this.replacePlaceholders(template.emailBody, alert)
        };
        break;
      case 'sms':
        message = this.replacePlaceholders(template.smsBody, alert);
        break;
      case 'push':
        message = {
          title: this.replacePlaceholders(template.pushTitle, alert),
          body: this.replacePlaceholders(template.pushBody, alert)
        };
        break;
    }

    return message;
  }

  /**
   * Replace placeholders in template
   */
  replacePlaceholders(template, alert) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return alert.data?.[key] || alert[key] || match;
    });
  }

  /**
   * Send email notification (simulated)
   */
  async sendEmail(alert, message) {
    console.log('📧 Sending email:', {
      to: this.notificationSettings.email.address,
      subject: message.subject,
      body: message.body
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In real implementation, integrate with email service like SendGrid, AWS SES, etc.
    return { success: true, messageId: `email_${Date.now()}` };
  }

  /**
   * Send SMS notification (simulated)
   */
  async sendSMS(alert, message) {
    console.log('📱 Sending SMS:', {
      to: this.notificationSettings.sms.number,
      message: message
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In real implementation, integrate with SMS service like Twilio, AWS SNS, etc.
    return { success: true, messageId: `sms_${Date.now()}` };
  }

  /**
   * Send push notification (simulated)
   */
  async sendPushNotification(alert, message) {
    console.log('🔔 Sending push notification:', message);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // In real implementation, integrate with push notification service
    return { success: true, messageId: `push_${Date.now()}` };
  }

  /**
   * Send webhook notification (simulated)
   */
  async sendWebhook(alert, message) {
    if (!this.notificationSettings.webhook.enabled) return;
    
    console.log('🔗 Sending webhook:', {
      url: this.notificationSettings.webhook.url,
      payload: alert
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, messageId: `webhook_${Date.now()}` };
  }

  /**
   * Check if alert is rate limited
   */
  isRateLimited(alert) {
    const key = `${alert.type}_${alert.deviceId}`;
    const limit = this.rateLimits.get(key);
    
    if (!limit) return false;
    
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    
    // Remove old entries
    limit.timestamps = limit.timestamps.filter(ts => now - ts < timeWindow);
    
    // Check if we've exceeded the limit
    return limit.timestamps.length >= limit.maxCount;
  }

  /**
   * Update rate limiting
   */
  updateRateLimit(alert) {
    const key = `${alert.type}_${alert.deviceId}`;
    const limit = this.rateLimits.get(key) || { timestamps: [], maxCount: 3 };
    
    limit.timestamps.push(Date.now());
    this.rateLimits.set(key, limit);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId, userId = 'system') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date().toISOString();
      this.notifySubscribers(alert);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId, userId = 'system', resolution = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = userId;
      alert.resolvedAt = new Date().toISOString();
      alert.resolution = resolution;
      this.notifySubscribers(alert);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get alerts by device
   */
  getAlertsByDevice(deviceId) {
    return this.alerts.filter(alert => alert.deviceId === deviceId);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    const total = this.alerts.length;
    const active = this.alerts.filter(a => !a.resolved).length;
    const critical = this.alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
    const acknowledged = this.alerts.filter(a => a.acknowledged && !a.resolved).length;

    return {
      total,
      active,
      critical,
      acknowledged,
      resolved: total - active,
      acknowledgmentRate: total > 0 ? (acknowledged / active) * 100 : 0
    };
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings) {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
  }

  /**
   * Subscribe to alert updates
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  /**
   * Notify subscribers
   */
  notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          alerts: [...this.alerts],
          statistics: this.getAlertStatistics(),
          updatedAlert: alert
        });
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Generate unique alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create global alert manager instance
export const alertManager = new AlertManager();

// Export convenience functions
export function createAlert(alertData) {
  return alertManager.createAlert(alertData);
}

export function acknowledgeAlert(alertId, userId) {
  return alertManager.acknowledgeAlert(alertId, userId);
}

export function resolveAlert(alertId, userId, resolution) {
  return alertManager.resolveAlert(alertId, userId, resolution);
}

export function getActiveAlerts() {
  return alertManager.getActiveAlerts();
}

export function getAlertStatistics() {
  return alertManager.getAlertStatistics();
}

export function subscribeToAlerts(callback) {
  return alertManager.subscribe(callback);
}

export function updateNotificationSettings(settings) {
  return alertManager.updateNotificationSettings(settings);
}
