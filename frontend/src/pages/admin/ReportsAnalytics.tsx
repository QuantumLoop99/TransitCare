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
  
  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reportData, setReportData] = useState<ReportData>({});
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedReport, dateRange]);

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
        'performance': ['resolution-times', 'complaints-by-status']
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

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      try {
        await generatePDFReport();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to export PDF. Please try again.');
      }
    } else {
      // CSV export
      try {
        const csvContent = generateCSVContent();
        downloadFile(csvContent, `TransitCare_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      } catch (error) {
        console.error('Error generating CSV:', error);
        alert('Failed to export CSV. Please try again.');
      }
    }
  };

  const generatePDFReport = async (): Promise<void> => {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download PDF');
      return;
    }

    const analytics = calculateAnalytics();
    const currentDate = new Date().toLocaleDateString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TransitCare Analytics Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #3B82F6; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              color: #3B82F6; 
              margin: 0; 
              font-size: 28px; 
            }
            .meta-info { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section h2 { 
              color: #374151; 
              border-bottom: 2px solid #E5E7EB; 
              padding-bottom: 10px; 
              margin-bottom: 15px; 
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .stat-card { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center; 
              border: 1px solid #e9ecef; 
            }
            .stat-number { 
              font-size: 32px; 
              font-weight: bold; 
              color: #3B82F6; 
            }
            .stat-label { 
              color: #6b7280; 
              margin-top: 5px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #e9ecef; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold; 
              color: #374151; 
            }
            .progress-bar { 
              background: #e9ecef; 
              height: 8px; 
              border-radius: 4px; 
              overflow: hidden; 
              margin: 5px 0; 
            }
            .progress-fill { 
              background: #3B82F6; 
              height: 100%; 
              transition: width 0.3s ease; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e9ecef; 
              color: #6b7280; 
              font-size: 14px; 
            }
            @media print {
              body { margin: 20px; }
              .header { border-bottom-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TransitCare Analytics Report</h1>
            <p>Comprehensive Complaint Management Analytics</p>
          </div>

          <div class="meta-info">
            <strong>Generated:</strong> ${currentDate} | 
            <strong>Period:</strong> ${dateRange.toUpperCase()} | 
            <strong>Report Type:</strong> ${selectedReport.toUpperCase()}
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${analytics.totalComplaints}</div>
              <div class="stat-label">Total Complaints</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.resolvedComplaints}</div>
              <div class="stat-label">Resolved</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.resolutionRate}%</div>
              <div class="stat-label">Resolution Rate</div>
            </div>
          </div>

          <div class="section">
            <h2>Complaints by Category</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(analytics.categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = ((count / analytics.totalComplaints) * 100).toFixed(1);
                    return `
                      <tr>
                        <td style="text-transform: capitalize;">${category}</td>
                        <td>${count}</td>
                        <td>${percentage}%</td>
                        <td>
                          <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Priority Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Priority Level</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                ${['high', 'medium', 'low'].map(priority => {
                  const count = analytics.priorityBreakdown[priority] || 0;
                  const percentage = analytics.totalComplaints > 0 ? ((count / analytics.totalComplaints) * 100).toFixed(1) : '0';
                  return `
                    <tr>
                      <td style="text-transform: capitalize;">${priority}</td>
                      <td>${count}</td>
                      <td>${percentage}%</td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-fill" style="width: ${percentage}%; background: ${priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'}"></div>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Status Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(analytics.statusBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([status, count]) => {
                    const percentage = ((count / analytics.totalComplaints) * 100).toFixed(1);
                    return `
                      <tr>
                        <td style="text-transform: capitalize;">${status.replace('-', ' ')}</td>
                        <td>${count}</td>
                        <td>${percentage}%</td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>

          ${analytics.monthlyTrends.length > 0 ? `
          <div class="section">
            <h2>Monthly Trends</h2>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Complaints</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.monthlyTrends.map((trend: any) => `
                  <tr>
                    <td>${trend.period}</td>
                    <td>${trend.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${analytics.resolutionTimes.length > 0 ? `
          <div class="section">
            <h2>Average Resolution Times</h2>
            <table>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Average Hours</th>
                  <th>Resolved Count</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.resolutionTimes.map((rt: any) => `
                  <tr>
                    <td style="text-transform: capitalize;">${rt.priority}</td>
                    <td>${rt.averageTimeHours.toFixed(1)} hours</td>
                    <td>${rt.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            Generated by TransitCare Analytics System<br>
            Report contains data for the selected ${dateRange} period
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };

  const generateCSVContent = (): string => {
    const analytics = calculateAnalytics();
    
    let csv = "Report Type,Category,Value,Count,Percentage\n";
    
    // Add category data
    Object.entries(analytics.categoryBreakdown).forEach(([category, count]) => {
      const percentage = ((count / analytics.totalComplaints) * 100).toFixed(1);
      csv += `Category,"${category}",${count},${count},${percentage}\n`;
    });
    
    // Add priority data
    ['high', 'medium', 'low'].forEach(priority => {
      const count = analytics.priorityBreakdown[priority] || 0;
      const percentage = analytics.totalComplaints > 0 ? ((count / analytics.totalComplaints) * 100).toFixed(1) : '0';
      csv += `Priority,"${priority}",${count},${count},${percentage}\n`;
    });
    
    // Add status data
    Object.entries(analytics.statusBreakdown).forEach(([status, count]) => {
      const percentage = ((count / analytics.totalComplaints) * 100).toFixed(1);
      csv += `Status,"${status}",${count},${count},${percentage}\n`;
    });
    
    return csv;
  };

  const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            Export CSV
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

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/10 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Complaints by Category
                </h2>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {Object.keys(analytics.categoryBreakdown).length} Categories
                </div>
              </div>
              {Object.keys(analytics.categoryBreakdown).length > 0 ? (
                <>
                  <div className="space-y-4 mb-8">
                    {Object.entries(analytics.categoryBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([category, count]) => {
                        const percentage = ((count / analytics.totalComplaints) * 100).toFixed(1);
                        return (
                          <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <span className="capitalize text-gray-800 dark:text-gray-200 font-medium text-lg">
                                {category}
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                  {percentage}%
                                </span>
                                <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold min-w-12 text-center">
                                  {count}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${percentage}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                      Category Distribution
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(analytics.categoryBreakdown)
                              .sort(([,a], [,b]) => b - a)
                              .map(([category, count]) => ({
                              name: category,
                              value: count
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            fill="#3B82F6"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {Object.entries(analytics.categoryBreakdown).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 220}, 70%, ${50 + index * 5}%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [value, name]} />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No category data available</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Data will appear here once complaints are submitted</p>
                </div>
              )}
            </Card>

            <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/10 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Priority Distribution
                </h2>
                <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  3 Levels
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {['high', 'medium', 'low'].map(priority => {
                  const count = analytics.priorityBreakdown[priority] || 0;
                  const percentage = analytics.totalComplaints > 0 ? ((count / analytics.totalComplaints) * 100).toFixed(1) : '0';
                  const priorityConfig: Record<string, {bg: string, text: string, gradient: string, icon: string}> = {
                    high: {
                      bg: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                      text: 'text-red-800 dark:text-red-300',
                      gradient: 'from-red-500 to-red-600',
                      icon: '🔥'
                    },
                    medium: {
                      bg: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                      text: 'text-yellow-800 dark:text-yellow-300',
                      gradient: 'from-yellow-500 to-yellow-600',
                      icon: '⚡'
                    },
                    low: {
                      bg: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                      text: 'text-green-800 dark:text-green-300',
                      gradient: 'from-green-500 to-green-600',
                      icon: '📝'
                    }
                  };
                  const config = priorityConfig[priority];
                  return (
                    <div key={priority} className={`${config.bg} border rounded-lg p-5 transition-all duration-200 hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{config.icon}</span>
                          <span className={`capitalize font-semibold text-lg ${config.text}`}>
                            {priority} Priority
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`${config.text} text-sm font-medium`}>
                            {percentage}%
                          </span>
                          <span className={`bg-gradient-to-r ${config.gradient} text-white rounded-full px-4 py-2 text-sm font-bold min-w-12 text-center shadow-sm`}>
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`bg-gradient-to-r ${config.gradient} h-3 rounded-full transition-all duration-700 ease-out`}
                          style={{
                            width: `${percentage}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  Priority Comparison
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={['high', 'medium', 'low'].map(priority => ({
                        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
                        count: analytics.priorityBreakdown[priority] || 0,
                        fill: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap={"20%"}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="priority" 
                        tick={{ fontSize: 14, fontWeight: 500 }}
                        stroke="#6B7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Complaints']}
                        labelFormatter={(label) => `${label} Priority`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Monthly Trends Chart */}
          {analytics.monthlyTrends.length > 0 && (
            <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/10 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Monthly Complaint Trends
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track complaint volume patterns over time
                  </p>
                </div>
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{analytics.monthlyTrends.length} Periods</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.monthlyTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#E5E7EB" 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        stroke="#9CA3AF"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        stroke="#9CA3AF"
                        label={{ 
                          value: 'Number of Complaints', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#6B7280', fontSize: '12px' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Complaints']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        cursor={{
                          stroke: '#10B981',
                          strokeWidth: 2,
                          strokeDasharray: '5 5'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Monthly Complaints"
                        dot={{ 
                          fill: '#10B981', 
                          strokeWidth: 3, 
                          r: 5,
                          stroke: '#ffffff'
                        }}
                        activeDot={{ 
                          r: 7, 
                          fill: '#059669',
                          stroke: '#ffffff',
                          strokeWidth: 3
                        }}
                        filter="drop-shadow(0px 2px 4px rgba(16, 185, 129, 0.2))"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.max(...analytics.monthlyTrends.map((t: any) => t.count))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Peak Month</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(analytics.monthlyTrends.reduce((sum: number, t: any) => sum + t.count, 0) / analytics.monthlyTrends.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average/Month</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.monthlyTrends.reduce((sum: number, t: any) => sum + t.count, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Period</div>
                  </div>
                </div>
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
    </div>
  );
};
