import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ComplaintForm } from '../../components/forms/ComplaintForm';
import { apiClient } from '../../lib/api';
import { ComplaintFormData } from '../../types';

export const NewComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState<string>('');

  const handleSubmit = async (data: ComplaintFormData) => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem('userEmail'); // ✅ get actual logged-in email

      const response = await apiClient.createComplaint({
        ...data,
        submittedBy: userEmail || 'anonymous', // ✅ use stored email instead of 'current-user'
        priority: 'medium', // default priority, updated later by AI
        status: 'pending',
      });

      if (response.success && response.data) {
        setComplaintId(response.data.id);
        setSuccess(true);

        // Trigger AI prioritization
        await apiClient.prioritizeComplaint(response.data.id);
      } else {
        throw new Error(response.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Complaint Submitted Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your complaint has been submitted and assigned ID:{' '}
            <strong>{complaintId}</strong>
            <br />
            You will receive updates via email as your complaint is processed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/passenger/complaints')}>
              View My Complaints
            </Button>
            <Button variant="outline" onClick={() => navigate('/passenger/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Submit New Complaint</h1>
        <p className="text-gray-600 mt-2">
          Please provide detailed information about the issue you experienced with public transport.
        </p>
      </div>

      <ComplaintForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};
