import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Complaint } from '../../types';

export const MyComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = localStorage.getItem('userEmail');
      const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      
      // ✅ use the correct backend URL and query parameter
      const response = await fetch(`http://localhost:3001/api/complaints${query}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();

      // ✅ backend returns { success, data: [...] }
      if (data.success && data.data) {
        setComplaints(data.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load complaints');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchComplaints();
}, []);


  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  // Priority badge temporarily disabled; re-enable when needed.

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your submitted complaints
          </p>
        </div>
        <Button onClick={() => navigate('/passenger/complaints/new')}>
          Submit New Complaint
        </Button>
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

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Complaints
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button onClick={() => navigate('/passenger/complaints/new')}>
            Submit Your First Complaint
          </Button>
        </Card>
      ) : filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Complaints Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? "You haven't submitted any complaints yet"
              : `No ${filter} complaints found`}
          </p>
          <Button onClick={() => navigate('/passenger/complaints/new')}>
            Submit Your First Complaint
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <Card 
              key={complaint._id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/passenger/complaints/${complaint._id}`)}
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
                  {/* <Badge variant={getPriorityColor(complaint.priority)}>
                    {complaint.priority.toUpperCase()} PRIORITY
                  </Badge> */}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {complaint.vehicleNumber && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {complaint.vehicleNumber}
                    </p>
                  </div>
                )}
                {complaint.route && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Route:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {complaint.route}
                    </p>
                  </div>
                )}
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
                {complaint.assignedTo && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Assigned To:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof complaint.assignedTo === 'object' 
                        ? `${(complaint.assignedTo as any).firstName || ''} ${(complaint.assignedTo as any).lastName || ''}`.trim()
                        : complaint.assignedTo}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/passenger/complaints/${complaint._id}`);
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
