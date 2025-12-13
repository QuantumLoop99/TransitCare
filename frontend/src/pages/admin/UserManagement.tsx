import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/input';
import { apiClient } from '../../lib/api';
import type { User } from '../../types';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        const usersWithRatings = await Promise.all(
          response.data.map(async (user) => {
            if (user.role === 'officer') {
              try {
                const ratingResponse = await apiClient.getOfficerRating(user.id);
                if (ratingResponse.success && ratingResponse.data) {
                  return {
                    ...user,
                    rating: ratingResponse.data.rating,
                    totalReviews: ratingResponse.data.totalReviews,
                  };
                }
              } catch (error) {
                console.warn(`Failed to fetch rating for officer ${user.id}:`, error);
              }
            }
            return user;
          })
        );
        setUsers(usersWithRatings);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email.split('@')[0];
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email.split('@')[0];
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'lastLogin':
        aValue = new Date(a.lastLogin || 0);
        bValue = new Date(b.lastLogin || 0);
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'officer': return 'info';
      case 'passenger': return 'default';
      default: return 'default';
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await apiClient.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <Button onClick={() => navigate('/admin/users/add')}>
          Add New User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name, email, phone, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="passenger">Passengers</option>
            <option value="officer">Officers</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="rating">Sort by Rating</option>
            <option value="lastLogin">Sort by Last Login</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'passenger').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Passengers</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'officer').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Officers</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
        </Card>
      </div>

      {/* Officer Rating Summary */}
      {users.filter(u => u.role === 'officer' && u.rating).length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Officer Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {(users.filter(u => u.role === 'officer' && u.rating)
                       .reduce((sum, u) => sum + (u.rating || 0), 0) / 
                  users.filter(u => u.role === 'officer' && u.rating).length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'officer' && (u.rating || 0) >= 4.0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Rated (4.0+)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'officer' && u.totalReviews)
                       .reduce((sum, u) => sum + (u.totalReviews || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      ) : filteredAndSortedUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Users Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No users match your search criteria
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email.split('@')[0]}
                          </div>
                          {user.department && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                      {user.phoneNumber && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'officer' ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.rating ? user.rating.toFixed(1) : 'N/A'}
                          </span>
                          {user.totalReviews && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({user.totalReviews} reviews)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                        {(user.status || 'active').toUpperCase()}
                      </Badge>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last: {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
