import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, UserCheck, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/dashboard/StatCard';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { apiClient } from '../../lib/api';
import { Complaint, DashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [complaintsResponse, statsResponse] = await Promise.all([
        apiClient.getComplaints({ limit: 3, sort: 'createdAt', order: 'desc' }),
        apiClient.getDashboardStats(),
      ]);

      if (complaintsResponse.success && complaintsResponse.data) {
        setRecentComplaints(complaintsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    window.open(`/admin/complaints/${complaint._id}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor system performance and manage all complaints and users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Complaints"
          value={stats?.totalComplaints || 0}
          icon={FileText}
          color="blue"
          change={{ value: 12, type: 'increase' }}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingComplaints || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedComplaints || 0}
          icon={CheckCircle}
          color="green"
          change={{ value: 8, type: 'increase' }}
        />
        <StatCard
          title="High Priority"
          value={stats?.priorityBreakdown?.high || 0}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Active Officers"
          value="24"
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Avg Resolution"
          value={`${stats?.averageResolutionTime || 0}h`}
          icon={Clock}
          color="gray"
          change={{ value: 5, type: 'decrease' }}
        />
      </div>

      {/* Priority Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Priority Distribution</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">High Priority</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.priorityBreakdown.high / stats.totalComplaints) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.priorityBreakdown.high}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Medium Priority</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.priorityBreakdown.medium / stats.totalComplaints) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.priorityBreakdown.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Low Priority</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.priorityBreakdown.low / stats.totalComplaints) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.priorityBreakdown.low}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Manage Users</div>
                    <div className="text-sm text-gray-500">Create officers and manage roles</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">View Reports</div>
                    <div className="text-sm text-gray-500">Generate detailed analytics</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/priority-rules')}
                  className="flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">AI Settings</div>
                    <div className="text-sm text-gray-500">Configure prioritization rules</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
          <button 
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => navigate('/admin/complaints')}
          >
            View All Complaints
          </button>
        </div>
        
        <ComplaintList
          complaints={recentComplaints}
          loading={loading}
          onViewDetails={handleViewComplaint}
          showAssignee={true}
        />
      </div>
    </div>
  );
};