/**
 * Notification Service
 * Handles alerts, notifications, and action confirmations
 */

// Mock notification storage (in real app, this would be a backend API)
let notifications = [];
let subscribers = [];

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  ALERT: {
    id: 'alert',
    name: 'Alert',
    icon: '🚨',
    color: 'red',
    priority: 'high'
  },
  ACTION: {
    id: 'action',
    name: 'Action Executed',
    icon: '⚡',
    color: 'blue',
    priority: 'medium'
  },
  DEVICE_STATUS: {
    id: 'device_status',
    name: 'Device Status',
    icon: '📱',
    color: 'yellow',
    priority: 'medium'
  },
  DATA_QUALITY: {
    id: 'data_quality',
    name: 'Data Quality',
    icon: '📊',
    color: 'orange',
    priority: 'low'
  },
  SYSTEM: {
    id: 'system',
    name: 'System',
    icon: '⚙️',
    color: 'gray',
    priority: 'low'
  }
};

/**
 * Create a new notification
 */
export function createNotification(notification) {
  const newNotification = {
    id: generateNotificationId(),
    timestamp: new Date().toISOString(),
    read: false,
    dismissed: false,
    ...notification
  };

  notifications.unshift(newNotification); // Add to beginning

  // Keep only last 100 notifications
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }

  // Notify subscribers
  notifySubscribers(newNotification);

  console.log('Notification created:', newNotification);
  return newNotification;
}

/**
 * Get all notifications
 */
export function getNotifications(limit = 50) {
  return notifications.slice(0, limit);
}

/**
 * Get unread notifications count
 */
export function getUnreadCount() {
  return notifications.filter(n => !n.read).length;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    notifySubscribers(notification);
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
  notifications.forEach(notification => {
    notification.read = true;
  });
  notifySubscribers();
}

/**
 * Dismiss notification
 */
export function dismissNotification(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.dismissed = true;
    notifySubscribers(notification);
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  notifications = [];
  notifySubscribers();
}

/**
 * Subscribe to notification updates
 */
export function subscribe(callback) {
  subscribers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

/**
 * Notify all subscribers
 */
function notifySubscribers(updatedNotification = null) {
  subscribers.forEach(callback => {
    try {
      callback({
        notifications: [...notifications],
        unreadCount: getUnreadCount(),
        updatedNotification
      });
    } catch (error) {
      console.error('Error notifying subscriber:', error);
    }
  });
}

/**
 * Create device alert notification
 */
export function createDeviceAlert(device, sensor, value, threshold, condition) {
  const type = NOTIFICATION_TYPES.ALERT;
  const conditionText = condition.replace('_', ' ');
  
  return createNotification({
    type: type.id,
    title: `Device Alert: ${device.name}`,
    message: `${sensor.replace('_', ' ')} is ${conditionText} ${threshold} (current: ${value})`,
    deviceId: device.id,
    deviceName: device.name,
    sensor,
    value,
    threshold,
    condition,
    metadata: {
      icon: type.icon,
      color: type.color,
      priority: type.priority
    }
  });
}

/**
 * Create action executed notification
 */
export function createActionNotification(device, action, result) {
  const type = NOTIFICATION_TYPES.ACTION;
  
  return createNotification({
    type: type.id,
    title: `Action Executed: ${action.name}`,
    message: `Action "${action.name}" was executed on device "${device.name}"`,
    deviceId: device.id,
    deviceName: device.name,
    actionId: action.id,
    actionType: action.type,
    result: result.status,
    metadata: {
      icon: type.icon,
      color: type.color,
      priority: type.priority
    }
  });
}

/**
 * Create device status notification
 */
export function createDeviceStatusNotification(device, oldStatus, newStatus) {
  const type = NOTIFICATION_TYPES.DEVICE_STATUS;
  
  return createNotification({
    type: type.id,
    title: `Device Status Changed: ${device.name}`,
    message: `Device status changed from "${oldStatus}" to "${newStatus}"`,
    deviceId: device.id,
    deviceName: device.name,
    oldStatus,
    newStatus,
    metadata: {
      icon: type.icon,
      color: type.color,
      priority: type.priority
    }
  });
}

/**
 * Create data quality notification
 */
export function createDataQualityNotification(device, quality, sensor) {
  const type = NOTIFICATION_TYPES.DATA_QUALITY;
  
  return createNotification({
    type: type.id,
    title: `Data Quality Alert: ${device.name}`,
    message: `Poor data quality detected for sensor "${sensor}" on device "${device.name}"`,
    deviceId: device.id,
    deviceName: device.name,
    sensor,
    quality,
    metadata: {
      icon: type.icon,
      color: type.color,
      priority: type.priority
    }
  });
}

/**
 * Create system notification
 */
export function createSystemNotification(title, message, metadata = {}) {
  const type = NOTIFICATION_TYPES.SYSTEM;
  
  return createNotification({
    type: type.id,
    title,
    message,
    metadata: {
      icon: type.icon,
      color: type.color,
      priority: type.priority,
      ...metadata
    }
  });
}

/**
 * Get notification type info
 */
export function getNotificationTypeInfo(typeId) {
  return Object.values(NOTIFICATION_TYPES).find(type => type.id === typeId);
}

/**
 * Format notification time
 */
export function formatNotificationTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Helper function
function generateNotificationId() {
  return 'notification_' + Math.random().toString(36).substr(2, 9);
}

// Auto-generate some sample notifications for demonstration
setTimeout(() => {
  createSystemNotification(
    'System Initialized',
    'IoT device management system is now active and monitoring devices.',
    { icon: '🎉', color: 'green' }
  );
}, 1000);
