import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, FileText, Bus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { ComplaintFormData } from '../../types';

interface ComplaintFormProps {
  onSubmit: (data: ComplaintFormData) => void;
  loading?: boolean;
  initialData?: Partial<ComplaintFormData>;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    defaultValues: initialData || {
      priority: 'medium',
      status: 'pending',
      category: 'service',
    },
  });

  const categories = [
    { value: 'service', label: 'Service Quality' },
    { value: 'safety', label: 'Safety Concern' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'staff', label: 'Staff Behavior' },
    { value: 'vehicle', label: 'Vehicle Condition' },
    { value: 'schedule', label: 'Schedule/Timing' },
    { value: 'other', label: 'Other' },
  ];

  const handleFormSubmit = (data: ComplaintFormData) => {
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Update Complaint' : 'Submit New Complaint'}
          </h2>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Title *"
                placeholder="Brief description of the issue"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters',
                  },
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Description *"
                placeholder="Provide detailed information about the issue..."
                error={errors.description?.message}
                rows={4}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters',
                  },
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('category', { required: 'Category is required' })}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Input
                label="Date & Time of Incident"
                type="datetime-local"
                error={errors.dateTime?.message}
                {...register('dateTime', {
                  required: 'Date and time are required',
                })}
              />
            </div>

            <div>
              <Input
                label="Vehicle Number"
                placeholder="e.g., DL-1PC-5678"
                error={errors.vehicleNumber?.message}
                {...register('vehicleNumber')}
              />
            </div>

            <div>
              <Input
                label="Route"
                placeholder="e.g., Route 405, Metro Line 2"
                error={errors.route?.message}
                {...register('route')}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Location"
                placeholder="Where did this incident occur?"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" loading={loading}>
              {initialData ? 'Update Complaint' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};