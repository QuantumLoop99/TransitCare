import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedComplaintId?: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch notifications from API
    const fetchNotifications = async () => {
      setLoading(true);
      // Simulated data
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            type: 'success',
            title: 'Complaint Resolved',
            message: 'Your complaint #1234 "Broken AC in Bus #1234" has been resolved.',
            timestamp: '2025-12-11T10:00:00',
            read: false,
            relatedComplaintId: '1234'
          },
          {
            id: '2',
            type: 'info',
            title: 'Status Update',
            message: 'Your complaint #1235 is now in progress.',
            timestamp: '2025-12-10T15:30:00',
            read: false,
            relatedComplaintId: '1235'
          },
          {
            id: '3',
            type: 'warning',
            title: 'Additional Information Required',
            message: 'Please provide more details about complaint #1236.',
            timestamp: '2025-12-09T12:00:00',
            read: true,
            relatedComplaintId: '1236'
          },
          {
            id: '4',
            type: 'info',
            title: 'New Message',
            message: 'You have a new message from the transport representative.',
            timestamp: '2025-12-08T09:15:00',
            read: true
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    // TODO: Update read status in API
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    // TODO: Update all read status in API
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    // TODO: Delete notification in API
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return '•';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-700';
      case 'info': return 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-700';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-700';
      case 'error': return 'bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-700';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 && `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${
            filter === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium ${
            filter === 'unread'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? "You're all caught up! No notifications to show."
              : "You have no unread notifications."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.read ? 'bg-opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className={`text-2xl ${getIconColor(notification.type)} mr-4 mt-1`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="info" className="text-xs">NEW</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
