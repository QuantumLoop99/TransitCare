import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';

export const AddEditPriorityRule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    conditions: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.conditions || !formData.priority) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // TODO: Submit to API
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/admin/priority-rules');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate('/admin/priority-rules')}>
          ← Back to Priority Rules
        </Button>
      </div>

      <Card className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? 'Edit Priority Rule' : 'Add New Priority Rule'}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rule Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Safety Issues Priority"
            />
          </div>

          <div>
            <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conditions *
            </label>
            <textarea
              id="conditions"
              name="conditions"
              required
              value={formData.conditions}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., category = 'safety' OR keywords contains 'emergency'"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Define the conditions that trigger this rule
            </p>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned Priority *
            </label>
            <select
              id="priority"
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Activate this rule immediately
            </label>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Rule' : 'Create Rule')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/priority-rules')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
