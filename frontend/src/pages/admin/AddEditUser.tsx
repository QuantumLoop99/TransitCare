import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';

export const AddEditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'passenger' as 'passenger' | 'officer' | 'admin',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isEdit && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };

      if (isEdit) {
        const response = await apiClient.updateUser(id!, userData);
        if (response.success) {
          navigate('/admin/users');
        } else {
          setError(response.error || 'Failed to update user');
        }
      } else {
        const response = await apiClient.createUser(userData);
        if (response.success) {
          navigate('/admin/users');
        } else {
          setError(response.error || 'Failed to create user');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          ← Back to User Management
        </Button>
      </div>

      <Card className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? 'Edit User' : 'Add New User'}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="passenger">Passenger</option>
              <option value="officer">Transport Officer</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose the appropriate role for this user
            </p>
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                minLength={8}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 8 characters long
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
