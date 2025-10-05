import { useState, useEffect } from 'react';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  dismissNotification,
  clearAllNotifications,
  subscribe,
  NOTIFICATION_TYPES,
  formatNotificationTime,
  getNotificationTypeInfo
} from '../../services/notificationService';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Subscribe to notification updates
    const unsubscribe = subscribe(({ notifications: newNotifications, unreadCount: newUnreadCount }) => {
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    });

    return unsubscribe;
  }, []);

  const loadNotifications = () => {
    const notificationList = getNotifications();
    const count = getUnreadCount();
    setNotifications(notificationList);
    setUnreadCount(count);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDismiss = (notificationId) => {
    dismissNotification(notificationId);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const getNotificationIcon = (notification) => {
    const typeInfo = getNotificationTypeInfo(notification.type);
    return typeInfo?.icon || notification.metadata?.icon || '🔔';
  };

  const getNotificationColor = (notification) => {
    const typeInfo = getNotificationTypeInfo(notification.type);
    const color = typeInfo?.color || notification.metadata?.color || 'gray';
    
    const colorClasses = {
      red: 'border-red-500 bg-red-900/20',
      blue: 'border-blue-500 bg-blue-900/20',
      yellow: 'border-yellow-500 bg-yellow-900/20',
      orange: 'border-orange-500 bg-orange-900/20',
      green: 'border-green-500 bg-green-900/20',
      gray: 'border-gray-500 bg-gray-900/20'
    };

    return colorClasses[color] || colorClasses.gray;
  };

  const getPriorityColor = (notification) => {
    const typeInfo = getNotificationTypeInfo(notification.type);
    const priority = typeInfo?.priority || notification.metadata?.priority || 'low';
    
    const priorityClasses = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-gray-400'
    };

    return priorityClasses[priority] || priorityClasses.low;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-300 hover:text-white transition-colors"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute top-12 right-0 w-80 bg-gray-900 border border-green-800 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-400">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-400">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showPanel && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  );
}

// Individual Notification Item Component
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDismiss, 
  getNotificationIcon, 
  getNotificationColor, 
  getPriorityColor 
}) {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    setShowDetails(!showDetails);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  return (
    <div 
      className={`p-3 cursor-pointer transition-colors hover:bg-gray-800/50 ${
        !notification.read ? 'bg-gray-800/30' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${getNotificationColor(notification)}`}>
          {getNotificationIcon(notification)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                {notification.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              {/* Additional Details */}
              {showDetails && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {notification.deviceName && (
                    <p>Device: {notification.deviceName}</p>
                  )}
                  {notification.sensor && (
                    <p>Sensor: {notification.sensor}</p>
                  )}
                  {notification.value !== undefined && (
                    <p>Value: {notification.value}</p>
                  )}
                  {notification.threshold !== undefined && (
                    <p>Threshold: {notification.threshold}</p>
                  )}
                  {notification.actionType && (
                    <p>Action: {notification.actionType}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              <span className={`text-xs ${getPriorityColor(notification)}`}>
                {formatNotificationTime(notification.timestamp)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
