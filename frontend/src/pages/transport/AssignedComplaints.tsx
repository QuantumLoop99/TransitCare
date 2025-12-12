import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Complaint } from '../../types';
import { apiClient } from '../../lib/api';

export const AssignedComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        // Get current officer's email/ID from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        
        // Fetch all complaints from API
        const response = await apiClient.getComplaints();
        
        if (response.success && response.data) {
          // Filter complaints assigned to current officer
          const allComplaints = response.data;
          const assignedComplaints = allComplaints.filter(complaint => 
            complaint.assignedTo === userId || 
            complaint.assignedTo === userEmail ||
            complaint.assignedTo === 'current-officer' // Fallback for mock data
          );
          
          setComplaints(assignedComplaints);
        }
      } catch (error) {
        console.error('Error fetching assigned complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assigned Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage complaints assigned to you
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Status Filter */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium ${
              filter === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 font-medium ${
              filter === 'pending'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending ({complaints.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 font-medium ${
              filter === 'in-progress'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            In Progress ({complaints.filter(c => c.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 font-medium ${
              filter === 'resolved'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Resolved ({complaints.filter(c => c.status === 'resolved').length})
          </button>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
        </div>
      ) : sortedComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Complaints Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? "You don't have any complaints assigned to you"
              : `No ${filter} complaints found`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/transport/complaints/${complaint._id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {complaint.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {complaint.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <Badge variant={getStatusColor(complaint.status)}>
                    {complaint.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={getPriorityColor(complaint.priority)}>
                    {complaint.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {complaint.vehicleNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Route:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {complaint.route}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {complaint.category}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {complaint.resolution && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Resolution:</strong> {complaint.resolution}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {complaint.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/transport/complaints/${complaint._id}`);
                    }}
                  >
                    Update Status
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/transport/complaints/${complaint._id}`);
                  }}
                >
                  View Details →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
