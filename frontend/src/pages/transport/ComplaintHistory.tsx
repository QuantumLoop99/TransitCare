import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/input';
import { Complaint } from '../../types';
import { apiClient } from '../../lib/api';

export const ComplaintHistory: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Get current officer's email/ID from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        const assignees = [userId, userEmail].filter(Boolean);
        const filters = assignees.length ? { assignedTo: assignees.join(','), limit: 1000 } : { limit: 1000 };

        const response = await apiClient.getComplaints(filters);
        
        if (response.success && response.data) {
          // Filter for resolved/closed complaints assigned to current officer
          const resolvedComplaints = response.data.filter(complaint => 
            ((assignees.length ? assignees.includes(String(complaint.assignedTo)) : false) ||
             complaint.assignedTo === 'current-officer') &&
            (complaint.status === 'resolved' || complaint.status === 'closed')
          );
          
          setComplaints(resolvedComplaints);
        }
      } catch (error) {
        console.error('Error fetching complaint history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Complaint History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all previously resolved complaints
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by title, description, or vehicle number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="facilities">Facilities</option>
            <option value="behavior">Behavior</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="schedule">Schedule</option>
            <option value="safety">Safety</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No History Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory !== 'all'
              ? 'No complaints match your search criteria'
              : "You don't have any resolved complaints yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
          </p>
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/transport/complaints/${complaint._id}?readonly=true`)}
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
                <div className="ml-4">
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
                  <span className="text-gray-500 dark:text-gray-400">Resolved:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(complaint.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {complaint.resolution && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-green-700 dark:text-green-400">Resolution:</strong>{' '}
                    {complaint.resolution}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
