import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/input';
import { ComplaintFormData } from '../../types';

// Add a list of districts (example values, adjust as needed)
const districts = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];
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

  const [geoLocation, setGeoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');

  // Function to get live location when user clicks the button
  const handleGetLiveLocation = () => {
    if ('geolocation' in navigator) {
      setLocationStatus('fetching');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationStatus('error');
        }
      );
    } else {
      console.warn('Geolocation not supported by browser');
      setLocationStatus('error');
    }
  };

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
    const complaintData = {
      ...data,
      geoLocation, // include coordinates if available
    };

    onSubmit(complaintData);
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Incident *
              </label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                max={new Date().toISOString().split('T')[0]}
                {...register('dateTime', {
                  required: 'Date of incident is required',
                })}
              />
              {errors.dateTime && (
                <p className="text-sm text-red-600 mt-1">{errors.dateTime.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">When did this incident occur?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (Optional)
              </label>
              <input
                type="time"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('incidentTime')}
              />
              <p className="text-xs text-gray-500 mt-1">Approximate time of the incident</p>
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

            {/* Text location field */}
            <div className="md:col-span-2">
              <Input
                label="Location (optional)"
                placeholder="Where did this incident occur?"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            {/* District Dropdown */}
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">
                   District *
               </label>
                 <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...register('district', { required: 'District is required' })}>
                  <option value="">Select a district</option>
                    {districts.map((district) => (
                   <option key={district} value={district}>
                      {district}
                    </option>))}
                </select>
                    {errors.district && (
                     <p className="text-sm text-red-600 mt-1">{errors.district.message}</p>)}
            </div> 

            {/* Live location capture */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {locationStatus === 'idle' && <span>Use live location for accurate tracking</span>}
                  {locationStatus === 'fetching' && <span>Fetching your live location...</span>}
                  {locationStatus === 'success' && geoLocation && (
                    <span>
                      Live location captured: {geoLocation.latitude.toFixed(4)}, {geoLocation.longitude.toFixed(4)}
                    </span>
                  )}
                  {locationStatus === 'error' && (
                    <span className="text-red-600">
                      Could not retrieve live location. Please allow location access or enter manually.
                    </span>
                  )}
                </div>
                {locationStatus !== 'success' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLiveLocation}
                    disabled={locationStatus === 'fetching'}
                  >
                    {locationStatus === 'fetching' ? 'Getting Location...' : 'Get Live Location'}
                  </Button>
                )}
              </div>
            </div>

            {/* Map display */}
            {locationStatus === 'success' && geoLocation && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location on Map
                </label>
                <div className="relative w-full h-64 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoLocation.longitude - 0.01},${geoLocation.latitude - 0.01},${geoLocation.longitude + 0.01},${geoLocation.latitude + 0.01}&layer=mapnik&marker=${geoLocation.latitude},${geoLocation.longitude}`}
                  />
                  <div className="absolute top-2 right-2 bg-white px-3 py-1.5 rounded-md shadow-sm text-xs text-gray-600 border border-gray-200">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${geoLocation.latitude}&mlon=${geoLocation.longitude}#map=15/${geoLocation.latitude}/${geoLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Larger Map
                    </a>
                  </div>
                </div>
              </div>
            )}
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
