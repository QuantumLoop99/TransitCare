import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { Complaint } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportData {
  [key: string]: any;
}

export const ReportsAnalytics: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('trends');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reportData, setReportData] = useState<ReportData>({});
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Categories for filtering
  const categories = ['all', 'bus-delay', 'poor-service', 'overcrowding', 'safety', 'cleanliness', 'other'];
  const statuses = ['all', 'pending', 'in-progress', 'resolved', 'closed'];

  useEffect(() => {
    fetchData();
  }, [selectedReport, dateRange, selectedCategory, selectedStatus]);

  const getDateFilter = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  const fetchComplaints = async () => {
    try {
      const filters: Record<string, any> = getDateFilter();
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      // Set a high limit to get all complaints for reporting
      filters.limit = 1000;
      
      const response = await apiClient.getComplaints(filters);
      if (response.success && response.data) {
        setComplaints(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  };

  const fetchReportData = async (reportType: string) => {
    try {
      const filters = getDateFilter();
      const response = await apiClient.getReports(reportType, filters);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to fetch ${reportType} data`);
      }
    } catch (error) {
      console.error(`Error fetching ${reportType}:`, error);
      throw error;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchComplaints();
      
      // Fetch specific report data based on selected report type
      const reportTypes = {
        'trends': ['complaints-by-category', 'complaints-by-priority', 'complaints-by-status', 'monthly-trends'],
        'performance': ['resolution-times', 'complaints-by-status'],
        'hotspots': ['complaints-by-category']
      };
      
      const types = reportTypes[selectedReport as keyof typeof reportTypes] || [];
      const data: ReportData = {};
      
      for (const type of types) {
        try {
          data[type] = await fetchReportData(type);
        } catch (err) {
          // Continue with other reports even if one fails
          console.warn(`Failed to fetch ${type}:`, err);
        }
      }
      
      setReportData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from both complaints and report data
  const calculateAnalytics = () => {
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : '0';

    // Use API data when available, fall back to calculated data
    const categoryBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    const locationBreakdown: Record<string, number> = {};

    // Process complaints data
    complaints.forEach(complaint => {
      categoryBreakdown[complaint.category] = (categoryBreakdown[complaint.category] || 0) + 1;
      priorityBreakdown[complaint.priority] = (priorityBreakdown[complaint.priority] || 0) + 1;
      statusBreakdown[complaint.status] = (statusBreakdown[complaint.status] || 0) + 1;
      const location = complaint.location || complaint.route || 'Unknown';
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;
    });

    // Override with API data if available
    if (reportData['complaints-by-category']?.length > 0) {
      reportData['complaints-by-category'].forEach((item: any) => {
        if (item._id && typeof item.count === 'number') {
          categoryBreakdown[item._id] = item.count;
        }
      });
    }

    if (reportData['complaints-by-priority']?.length > 0) {
      reportData['complaints-by-priority'].forEach((item: any) => {
        if (item._id && typeof item.count === 'number') {
          priorityBreakdown[item._id] = item.count;
        }
      });
    }

    if (reportData['complaints-by-status']?.length > 0) {
      reportData['complaints-by-status'].forEach((item: any) => {
        if (item._id && typeof item.count === 'number') {
          statusBreakdown[item._id] = item.count;
        }
      });
    }

    return {
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      categoryBreakdown,
      priorityBreakdown,
      statusBreakdown,
      locationBreakdown,
      monthlyTrends: reportData['monthly-trends'] || [],
      resolutionTimes: reportData['resolution-times'] || []
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

      {/* Filters */}
      <div className="space-y-4">
        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
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
        </div>

        {/* Additional Filters */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading report data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <div className="text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Error loading report data</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={fetchData}
                className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Report Content */}
      {!loading && !error && selectedReport === 'trends' && (
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
              {Object.keys(analytics.categoryBreakdown).length > 0 ? (
                <>
                  <div className="space-y-2 mb-6">
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
                  
                  {/* Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.categoryBreakdown).map(([category, count]) => ({
                            name: category,
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#3B82F6"
                          dataKey="value"
                          label
                        >
                          {Object.entries(analytics.categoryBreakdown).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No category data available</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Priority Distribution
              </h2>
              <div className="space-y-2 mb-6">
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

              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={['high', 'medium', 'low'].map(priority => ({
                      priority,
                      count: analytics.priorityBreakdown[priority] || 0,
                      color: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Monthly Trends Chart */}
          {analytics.monthlyTrends.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Monthly Complaint Trends
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.monthlyTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Complaints"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

      {!loading && !error && selectedReport === 'performance' && (
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
                const count = analytics.statusBreakdown[status] || 0;
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
                    <span className={`capitalize font-semibold ${textColors[status]}`}>{status.replace('-', ' ')}</span>
                    <span className={`text-2xl font-bold ${textColors[status]}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Resolution Times Chart */}
          {analytics.resolutionTimes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Average Resolution Time by Priority
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.resolutionTimes}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} hours`, 'Average Resolution Time']}
                      labelFormatter={(label) => `Priority: ${label}`}
                    />
                    <Bar dataKey="averageTimeHours" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                {analytics.resolutionTimes.map((item: any) => (
                  <div key={item.priority} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">{item.priority}</div>
                    <div className="text-gray-600 dark:text-gray-400">{item.averageTimeHours}h avg</div>
                    <div className="text-gray-600 dark:text-gray-400">{item.count} resolved</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {!loading && !error && selectedReport === 'hotspots' && (
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
