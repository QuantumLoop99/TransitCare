import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/dashboard/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Complaint, DashboardStats } from '../../types';
import { apiClient } from '../../lib/api';

export const TransportDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get current officer's email/ID from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        const assignees = [userId, userEmail].filter(Boolean);
        const filters = assignees.length ? { assignedTo: assignees.join(','), limit: 1000 } : { limit: 1000 };

        // Fetch complaints for this officer (or mock fallback)
        const response = await apiClient.getComplaints(filters);
        
        if (response.success && response.data) {
          const assignedComplaints = response.data.filter(complaint => {
            const matchesAssignedUser = assignees.length
              ? assignees.includes(String(complaint.assignedTo))
              : false;
            return matchesAssignedUser || complaint.assignedTo === 'current-officer';
          });

          // Calculate statistics from assigned complaints only
          const totalComplaints = assignedComplaints.length;
          const pendingComplaints = assignedComplaints.filter(c => c.status === 'pending').length;
          const resolvedComplaints = assignedComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
          
          // Calculate priority breakdown
          const priorityBreakdown = {
            high: assignedComplaints.filter(c => c.priority === 'high').length,
            medium: assignedComplaints.filter(c => c.priority === 'medium').length,
            low: assignedComplaints.filter(c => c.priority === 'low').length
          };
          
          setStats({
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            averageResolutionTime: 2.5, // TODO: Calculate from actual resolution times
            priorityBreakdown
          });
          
          // Get recent assigned complaints (last 5)
          const recent = assignedComplaints
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          
          setRecentComplaints(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Transport Representative Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and resolve assigned complaints
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Assigned to Me"
            value={stats.totalComplaints}
            icon="📋"
          />
          <StatCard
            title="Pending Action"
            value={stats.pendingComplaints}
            icon="⏳"
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedComplaints}
            icon="✓"
          />
          <StatCard
            title="Avg. Resolution Time"
            value={`${stats.averageResolutionTime} days`}
            icon="⏱"
          />
        </div>
      )}

      {/* Priority Breakdown */}
      {stats && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Priority Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.priorityBreakdown.high}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">High Priority</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.priorityBreakdown.medium}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Medium Priority</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {stats.priorityBreakdown.low}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low Priority</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Assigned Complaints */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Assigned Complaints
          </h2>
          <Button variant="outline" onClick={() => navigate('/transport/complaints')}>
            View All
          </Button>
        </div>

        {recentComplaints.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Complaints Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any complaints assigned to you at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recentComplaints.map((complaint) => (
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/transport/complaints/${complaint._id}`);
                    }}
                  >
                    View & Update →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/transport/complaints')}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold">View All Complaints</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/transport/complaints/history')}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <div className="font-semibold">Complaint History</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/transport/profile')}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">👤</div>
              <div className="font-semibold">My Profile</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
