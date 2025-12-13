import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';

interface Officer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  stats: {
    assigned: number;
    resolved: number;
    rating: number;
  };
  statsLoading?: boolean;
}

export const OfficerAssignment: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await apiClient.getUsers({ role: 'officer' });
        if (response.success && response.data) {
          const officersWithStats: Officer[] = response.data.map((user: any) => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            stats: {
              assigned: 0,
              resolved: 0,
              rating: 0,
            },
            statsLoading: true,
          }));

          setOfficers(officersWithStats);
          
          // Fetch stats for each officer
          await fetchOfficersStats(officersWithStats);
        }
      } catch (error) {
        console.error('Error fetching officers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  const fetchOfficersStats = async (officersList: Officer[]) => {
    const statsPromises = officersList.map(async (officer) => {
      try {
        const statsResponse = await apiClient.getOfficerStats(officer._id);
        if (statsResponse.success && statsResponse.data) {
          return {
            ...officer,
            stats: {
              assigned: statsResponse.data.totalAssignedComplaints,
              resolved: statsResponse.data.resolvedComplaints,
              rating: statsResponse.data.averageRating,
            },
            statsLoading: false,
          };
        }
      } catch (error) {
        console.error(`Error fetching stats for officer ${officer._id}:`, error);
      }
      return {
        ...officer,
        statsLoading: false,
      };
    });

    const updatedOfficers = await Promise.all(statsPromises);
    setOfficers(updatedOfficers);
  };

  const handleAssign = async (officerId: string) => {
    try {
      const response = await apiClient.updateComplaint(complaintId!, {
        assignedTo: officerId,
        status: 'in-progress'
      });

      if (response.success) {
        // Refresh stats for the assigned officer to show updated counts
        const updatedOfficers = [...officers];
        const officerIndex = updatedOfficers.findIndex(o => o._id === officerId);
        
        if (officerIndex !== -1) {
          updatedOfficers[officerIndex].statsLoading = true;
          setOfficers(updatedOfficers);
          
          try {
            const statsResponse = await apiClient.getOfficerStats(officerId);
            if (statsResponse.success && statsResponse.data) {
              updatedOfficers[officerIndex] = {
                ...updatedOfficers[officerIndex],
                stats: {
                  assigned: statsResponse.data.totalAssignedComplaints,
                  resolved: statsResponse.data.resolvedComplaints,
                  rating: statsResponse.data.averageRating,
                },
                statsLoading: false,
              };
              setOfficers(updatedOfficers);
            }
          } catch (error) {
            console.error('Error refreshing officer stats:', error);
            updatedOfficers[officerIndex].statsLoading = false;
            setOfficers(updatedOfficers);
          }
        }
        
        alert('Complaint successfully reassigned!');
        navigate('/admin/complaints');
      } else {
        alert('Failed to reassign complaint.');
      }
    } catch (error) {
      console.error('Error reassigning complaint:', error);
      alert('Error assigning complaint.');
    }
  };

  if (loading) {
    return <p className="text-center py-8">Loading officers...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Complaint</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Select an officer to handle this complaint.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officers.map(officer => (
          <Card key={officer._id} className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {officer.firstName} {officer.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{officer.email}</p>
            <div className="mt-4 space-y-1 text-sm">
              {officer.statsLoading ? (
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span>Assigned: </span>
                    <div className="ml-2 w-8 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </p>
                  <p className="flex items-center">
                    <span>Resolved: </span>
                    <div className="ml-2 w-8 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </p>
                  <p className="flex items-center">
                    <span>Rating: </span>
                    <div className="ml-2 w-12 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </p>
                </div>
              ) : (
                <>
                  <p>Assigned: <Badge variant="info">{officer.stats.assigned}</Badge></p>
                  <p>Resolved: <Badge variant="success">{officer.stats.resolved}</Badge></p>
                  <p>Rating: ⭐ {officer.stats.rating > 0 ? officer.stats.rating.toFixed(1) : 'No ratings yet'}</p>
                </>
              )}
            </div>
            <Button 
              className="mt-4 w-full" 
              onClick={() => handleAssign(officer._id)}
              disabled={officer.statsLoading}
            >
              Assign Complaint
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
