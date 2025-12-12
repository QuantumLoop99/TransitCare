import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, MapPin, User, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/dashboard/StatCard';
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
              <p className="text-sm text-gray-500 mt-1">Your latest submissions</p>
            </div>
            <Link to="/passenger/complaints">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
              <p className="text-gray-500 mb-6">Start by submitting your first complaint</p>
              <Link to="/passenger/complaints/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Complaint
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 3).map((complaint) => (
                <div
                  key={complaint._id}
                  onClick={() => handleViewDetails(complaint)}
                  className="group relative p-4 bg-white hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 border border-gray-200 hover:border-blue-400"
                >
                  {/* Status indicator line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    complaint.status === 'pending' ? 'bg-amber-500' : 
                    complaint.status === 'in-progress' ? 'bg-blue-600' : 
                    complaint.status === 'resolved' ? 'bg-green-600' : 'bg-gray-400'
                  }`} />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header with title and status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                          {complaint.title}
                        </h3>
                        <span className={`
                          px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap flex-shrink-0
                          ${complaint.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                          ${complaint.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                          ${complaint.status === 'resolved' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                          ${complaint.status === 'closed' ? 'bg-gray-50 text-gray-700 border border-gray-200' : ''}
                        `}>
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {complaint.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            {new Date(complaint.dateTime).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200">
                          {complaint.category}
                        </span>
                        
                        {complaint.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{complaint.location}</span>
                          </div>
                        )}
                        
                        {complaint.assignedTo && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {typeof complaint.assignedTo === 'object' 
                                ? `${(complaint.assignedTo as any).firstName || ''} ${(complaint.assignedTo as any).lastName || ''}`.trim()
                                : complaint.assignedTo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
