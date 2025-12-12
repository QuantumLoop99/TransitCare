import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/dashboard/StatCard';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { apiClient } from '../../lib/api';
import { Complaint } from '../../types';
import { useSyncUserEmail } from '../../useSyncUserEmail'; // new import
import { useNavigate } from 'react-router-dom';

export const PassengerDashboard: React.FC = () => {
  useSyncUserEmail(); // ensures userEmail is stored in localStorage after login

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
      const userEmail = localStorage.getItem('userEmail'); // stored after login

      const response = await apiClient.getComplaints({ userEmail });

      if (response.success && response.data) {
        const complaints = response.data;

        // Calculate stats based only on user's complaints
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in-progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

        setComplaints(complaints);
        setStats({ total, pending, inProgress, resolved });
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleViewDetails = (complaint: Complaint) => {
    navigate(`/passenger/complaints/${complaint._id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">
            Track your complaints and get real-time updates on their status.
          </p>
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
        <StatCard title="Total Complaints" value={stats.total} icon={FileText} color="blue" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress} icon={AlertTriangle} color="blue" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
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

        {/* Hide priority in ComplaintList */}
        <ComplaintList
          complaints={complaints.slice(0, 3)}
          loading={loading}
          onViewDetails={handleViewDetails}
          showPriority={false} 
        />
      </div>
    </div>
  );
};
