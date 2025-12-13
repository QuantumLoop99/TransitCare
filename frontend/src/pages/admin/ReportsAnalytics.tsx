import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { Complaint } from '../../types';

export const ReportsAnalytics: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('trends');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await apiClient.getComplaints();
      if (response.success && response.data) {
        setComplaints(response.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : '0';

    const categoryBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    const locationBreakdown: Record<string, number> = {};

    complaints.forEach(complaint => {
      categoryBreakdown[complaint.category] = (categoryBreakdown[complaint.category] || 0) + 1;
      priorityBreakdown[complaint.priority] = (priorityBreakdown[complaint.priority] || 0) + 1;
      const location = complaint.location || complaint.route || 'Unknown';
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;
    });

    return {
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      categoryBreakdown,
      priorityBreakdown,
      locationBreakdown
    };
  };

  const analytics = calculateAnalytics();

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    alert(`Exporting as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View insights and trends across all complaints
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setDateRange('week')}
          className={`px-4 py-2 rounded-md font-medium ${
            dateRange === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Last Week
        </button>
        <button
          onClick={() => setDateRange('month')}
          className={`px-4 py-2 rounded-md font-medium ${
            dateRange === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setDateRange('year')}
          className={`px-4 py-2 rounded-md font-medium ${
            dateRange === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Last Year
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedReport('trends')}
          className={`px-4 py-2 font-medium ${
            selectedReport === 'trends'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Complaint Trends
        </button>
        <button
          onClick={() => setSelectedReport('performance')}
          className={`px-4 py-2 font-medium ${
            selectedReport === 'performance'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Service Performance
        </button>
        <button
          onClick={() => setSelectedReport('hotspots')}
          className={`px-4 py-2 font-medium ${
            selectedReport === 'hotspots'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Hotspot Heatmaps
        </button>
      </div>

      {/* Report Content */}
      {selectedReport === 'trends' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Total Complaints: {analytics.totalComplaints}
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.totalComplaints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.resolvedComplaints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analytics.resolutionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Complaints by Category
              </h2>
              <div className="space-y-2">
                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-2">
                    <span className="capitalize text-gray-700 dark:text-gray-300">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.totalComplaints) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Priority Distribution
              </h2>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map(priority => {
                  const count = analytics.priorityBreakdown[priority] || 0;
                  const colors: Record<string, string> = {
                    high: 'bg-red-600',
                    medium: 'bg-yellow-500',
                    low: 'bg-green-500'
                  };
                  return (
                    <div key={priority} className="flex items-center justify-between p-2">
                      <span className="capitalize text-gray-700 dark:text-gray-300">{priority}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`${colors[priority]} h-2 rounded-full`}
                            style={{
                              width: `${analytics.totalComplaints > 0 ? (count / analytics.totalComplaints) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {selectedReport === 'performance' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.totalComplaints}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Complaints</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.resolutionRate}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Resolution Rate</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.resolvedComplaints}/{analytics.totalComplaints}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Resolved Cases</div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Status Distribution
            </h2>
            <div className="space-y-3">
              {['pending', 'in-progress', 'resolved', 'closed'].map(status => {
                const count = complaints.filter(c => c.status === status).length;
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 dark:bg-yellow-900/20',
                  'in-progress': 'bg-blue-100 dark:bg-blue-900/20',
                  resolved: 'bg-green-100 dark:bg-green-900/20',
                  closed: 'bg-gray-100 dark:bg-gray-900/20'
                };
                const textColors: Record<string, string> = {
                  pending: 'text-yellow-800 dark:text-yellow-300',
                  'in-progress': 'text-blue-800 dark:text-blue-300',
                  resolved: 'text-green-800 dark:text-green-300',
                  closed: 'text-gray-800 dark:text-gray-300'
                };
                return (
                  <div key={status} className={`flex items-center justify-between p-3 ${statusColors[status]} rounded`}>
                    <span className={`capitalize font-semibold ${textColors[status]}`}>{status}</span>
                    <span className={`text-2xl font-bold ${textColors[status]}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'hotspots' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Problem Areas by Location
            </h2>
            {Object.keys(analytics.locationBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.locationBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([location, count]) => {
                    const maxCount = Math.max(...Object.values(analytics.locationBreakdown));
                    return (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 font-medium min-w-40">{location || 'Unknown'}</span>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{
                                width: `${(count / maxCount) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No location data available</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Critical Routes (High Complaint Volume)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(analytics.locationBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([location, count]) => (
                  <Card key={location} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">{location || 'Unknown'}</span>
                      <span className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold">{count}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {((count / analytics.totalComplaints) * 100).toFixed(1)}% of total complaints
                    </p>
                  </Card>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
