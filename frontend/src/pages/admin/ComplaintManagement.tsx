import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/input';
import { Complaint } from '../../types';
import { apiClient } from '../../lib/api';

export const ComplaintManagement: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getComplaints();
      if (response.success && response.data) {
        setComplaints(response.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
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

  const handleEscalate = (complaintId: string) => {
    // TODO: Implement escalation logic
    alert(`Complaint ${complaintId} escalated`);
  };

  const handleReassign = (complaintId: string) => {
    navigate(`/admin/officers/${complaintId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complaint Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage all complaints in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="service">Service Quality</option>
              <option value="safety">Safety Concern</option>
              <option value="accessibility">Accessibility</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="staff">Staff Behavior</option>
              <option value="vehicle">Vehicle Condition</option>
              <option value="schedule">Schedule/Timing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {complaints.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {complaints.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {complaints.filter(c => c.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {complaints.filter(c => c.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
        </Card>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Complaints Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No complaints match your filter criteria
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
          </p>
          {filteredComplaints.map((complaint) => (
            <Card key={complaint._id} className="p-6">
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
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <p className="font-medium text-gray-900 dark:text-white">#{complaint._id}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {complaint.vehicleNumber}
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

              {complaint.status === 'resolved' && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    ✓ RESOLVED
                  </p>
                  {(complaint.resolution || complaint.resolutionNotes) ? (
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {complaint.resolution || complaint.resolutionNotes}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      No resolution notes provided
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReassign(complaint._id)}
                >
                  Assign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEscalate(complaint._id)}
                >
                  Escalate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
