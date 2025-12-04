import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ReportsAnalytics: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('trends');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

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
              Complaint Volume Over Time
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400">
                [Chart: Line graph showing complaint volume over selected time period]
              </p>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Complaints by Category
              </h2>
              <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-gray-500 dark:text-gray-400">
                  [Chart: Pie chart of categories]
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Priority Distribution
              </h2>
              <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-gray-500 dark:text-gray-400">
                  [Chart: Bar chart of priorities]
                </p>
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
                2.5 days
              </div>
              <div className="text-gray-600 dark:text-gray-400">Avg Resolution Time</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                87%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Resolution Rate</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                4.2/5
              </div>
              <div className="text-gray-600 dark:text-gray-400">Passenger Satisfaction</div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Service Performance by Route
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400">
                [Chart: Bar chart comparing routes]
              </p>
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'hotspots' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Complaint Hotspot Heatmap
            </h2>
            <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400">
                [Interactive map showing complaint density by location]
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top 10 Problem Areas
            </h2>
            <div className="space-y-3">
              {['Main Street Station', 'Downtown Terminal', 'Airport Route', 'University Stop', 'Central Hub'].map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center">
                    <span className="font-bold text-gray-900 dark:text-white mr-3">
                      {index + 1}.
                    </span>
                    <span className="text-gray-900 dark:text-white">{location}</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {Math.floor(Math.random() * 50) + 10} complaints
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
