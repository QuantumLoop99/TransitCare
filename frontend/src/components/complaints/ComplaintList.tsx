import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Complaint } from '../../types';

interface ComplaintListProps {
  complaints: Complaint[];
  loading?: boolean;
  onViewDetails?: (complaint: Complaint) => void;
  showAssignee?: boolean;
  showPriority?: boolean;
}

export const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  loading = false,
  onViewDetails,
  showAssignee = false,
  showPriority = true,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-500">There are no complaints matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complaints.map((complaint) => (
        <Card key={complaint._id} hover className="transition-all duration-200">
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {complaint.title}
                </h3>
                <div className="flex space-x-1">
                  <StatusBadge status={complaint.status} />
                  {showPriority && <PriorityBadge priority={complaint.priority} />}
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>

              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(complaint.dateTime).toLocaleDateString()}</span>
                </div>
                {complaint.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{complaint.location}</span>
                  </div>
                )}
              </div>

              {complaint.vehicleNumber && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-medium">Vehicle: {complaint.vehicleNumber}</span>
                  {complaint.route && <span className="ml-2">• {complaint.route}</span>}
                </div>
              )}

              {showAssignee && complaint.assignedTo && (
                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span>Assigned to: {complaint.assignedTo}</span>
                </div>
              )}

              <Badge variant="info" size="sm">
                {complaint.category}
              </Badge>

              <div className="pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onViewDetails?.(complaint)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};