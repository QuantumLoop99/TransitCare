import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SystemSettings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnNewComplaint: true,
    notifyOnStatusChange: true,
    notifyOnResolution: true
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoAssignment: true,
    aiPrioritization: true,
    maxFileSize: '10',
    sessionTimeout: '30'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSystemSettings({
      ...systemSettings,
      [e.target.name]: value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save settings to API
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Notification Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Email Notifications
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send notifications via email
              </p>
            </div>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={notificationSettings.emailNotifications}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                SMS Notifications
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send notifications via SMS
              </p>
            </div>
            <input
              type="checkbox"
              name="smsNotifications"
              checked={notificationSettings.smsNotifications}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Push Notifications
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send in-app push notifications
              </p>
            </div>
            <input
              type="checkbox"
              name="pushNotifications"
              checked={notificationSettings.pushNotifications}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                New Complaint Alerts
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notify when new complaints are submitted
              </p>
            </div>
            <input
              type="checkbox"
              name="notifyOnNewComplaint"
              checked={notificationSettings.notifyOnNewComplaint}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Status Change Alerts
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notify when complaint status changes
              </p>
            </div>
            <input
              type="checkbox"
              name="notifyOnStatusChange"
              checked={notificationSettings.notifyOnStatusChange}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Resolution Notifications
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notify when complaints are resolved
              </p>
            </div>
            <input
              type="checkbox"
              name="notifyOnResolution"
              checked={notificationSettings.notifyOnResolution}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          System Configuration
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Maintenance Mode
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Temporarily disable the system for maintenance
              </p>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={systemSettings.maintenanceMode}
              onChange={handleSystemChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Auto-Assignment
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically assign complaints to officers
              </p>
            </div>
            <input
              type="checkbox"
              name="autoAssignment"
              checked={systemSettings.autoAssignment}
              onChange={handleSystemChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                AI-Powered Prioritization
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use AI to automatically prioritize complaints
              </p>
            </div>
            <input
              type="checkbox"
              name="aiPrioritization"
              checked={systemSettings.aiPrioritization}
              onChange={handleSystemChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Maximum File Upload Size (MB)
            </label>
            <Input
              type="number"
              name="maxFileSize"
              value={systemSettings.maxFileSize}
              onChange={handleSystemChange}
              className="max-w-xs"
            />
          </div>

          <div className="py-3">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              name="sessionTimeout"
              value={systemSettings.sessionTimeout}
              onChange={handleSystemChange}
              className="max-w-xs"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
