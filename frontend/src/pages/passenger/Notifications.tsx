import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  userId: string;
  complaintId: { _id: string; title: string; status: string } | string;
  type: 'status_change' | 'new_message' | 'resolved';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    senderName?: string;
    senderRole?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getNotifications(userEmail, false);
        if (response.success && response.data) {
          setNotifications(response.data);
        } else {
          setError(response.error || 'Failed to fetch notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await apiClient.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
    
    try {
      const response = await apiClient.markAllNotificationsAsRead(userEmail);
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const complaintId = typeof notification.complaintId === 'string' 
      ? notification.complaintId 
      : notification.complaintId._id;
    
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    navigate(`/passenger/complaints/${complaintId}`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resolved': return '✓';
      case 'status_change': return 'ℹ';
      case 'new_message': return '💬';
      default: return '•';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'resolved': return 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-700';
      case 'status_change': return 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-700';
      case 'new_message': return 'bg-purple-100 dark:bg-purple-900 border-purple-400 dark:border-purple-700';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-700';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'resolved': return 'text-green-600 dark:text-green-400';
      case 'status_change': return 'text-blue-600 dark:text-blue-400';
      case 'new_message': return 'text-purple-600 dark:text-purple-400';
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
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      
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
              key={notification._id}
              className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.isRead ? 'bg-opacity-50' : ''
              } cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => handleNotificationClick(notification)}
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
                      {!notification.isRead && (
                        <Badge variant="info" className="text-xs">NEW</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {typeof notification.complaintId === 'object' && (
                        <span className="text-blue-600 dark:text-blue-400">
                          Complaint: {notification.complaintId.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
