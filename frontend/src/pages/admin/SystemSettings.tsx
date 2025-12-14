import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from backend on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: {
          'x-admin-secret': '8b3f1a6d9c2e4f0a7d8c5b6e3a1f2b4c6d7e8f90123456789abcdef01234567',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const settings = result.data;
        
        // Update system settings with data from backend
        setSystemSettings(prevSettings => ({
          ...prevSettings,
          aiPrioritization: settings.aiPrioritization ?? true,
          autoAssignment: settings.autoAssignment ?? true,
          maintenanceMode: settings.maintenanceMode ?? false,
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    try {
      // Only save the AI prioritization setting (the only implemented feature)
      const settingsToSave = {
        aiPrioritization: systemSettings.aiPrioritization,
      };

      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'x-admin-secret': '8b3f1a6d9c2e4f0a7d8c5b6e3a1f2b4c6d7e8f90123456789abcdef01234567',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settingsToSave,
          updatedBy: 'admin' // You can get this from user context
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save settings: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
      <Card className="p-6 opacity-60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Coming Soon
          </span>
        </div>
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            System Configuration
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Partially Available
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 opacity-60">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Maintenance Mode
                <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Coming Soon)</span>
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 opacity-60">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Auto-Assignment
                <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Coming Soon)</span>
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
              disabled
              className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                AI-Powered Prioritization
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Available</span>
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

          <div className="py-3 border-b border-gray-200 dark:border-gray-700 opacity-60">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Maximum File Upload Size (MB)
              <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Coming Soon)</span>
            </label>
            <Input
              type="number"
              name="maxFileSize"
              value={systemSettings.maxFileSize}
              onChange={handleSystemChange}
              disabled
              className="max-w-xs opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="py-3 opacity-60">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Session Timeout (minutes)
              <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Coming Soon)</span>
            </label>
            <Input
              type="number"
              name="sessionTimeout"
              value={systemSettings.sessionTimeout}
              onChange={handleSystemChange}
              disabled
              className="max-w-xs opacity-50 cursor-not-allowed"
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
