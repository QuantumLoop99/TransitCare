import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/dashbord/StatCard';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { apiClient } from '../../lib/api';
import { Complaint } from '../../types';

export const PassengerDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getComplaints({ limit: 6 });
      if (response.success && response.data) {
        setComplaints(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const pending = response.data.filter(c => c.status === 'pending').length;
        const inProgress = response.data.filter(c => c.status === 'in-progress').length;
        const resolved = response.data.filter(c => c.status === 'resolved' || c.status === 'closed').length;
        
        setStats({ total, pending, inProgress, resolved });
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    // Navigate to complaint details page
    window.open(`/passenger/complaints/${complaint.id}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Track your complaints and get real-time updates on their status.</p>
        </div>
        <Link to="/passenger/complaints/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={AlertTriangle}
          color="blue"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/passenger/complaints/new">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Plus className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Submit New Complaint</div>
                  <div className="text-sm text-gray-500">Report a new issue</div>
                </div>
              </Button>
            </Link>
            
            <Link to="/passenger/complaints">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <FileText className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">View All Complaints</div>
                  <div className="text-sm text-gray-500">See your complaint history</div>
                </div>
              </Button>
            </Link>

            <Link to="/passenger/profile">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <CheckCircle className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Update Profile</div>
                  <div className="text-sm text-gray-500">Manage your account</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Complaints */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
          <Link to="/passenger/complaints">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        <ComplaintList
          complaints={complaints}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
};