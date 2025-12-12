import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Complaint } from '../../types';
import { apiClient } from '../../lib/api';

interface Message {
  id: string;
  sender: 'passenger' | 'officer' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

export const TransportComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Complaint['status']>('pending');
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getComplaint(id);
        if (response.success && response.data) {
          setComplaint(response.data);
          setSelectedStatus(response.data.status);
        } else {
          setError(response.error || 'Failed to load complaint');
        }
      } catch (err) {
        console.error('Error fetching complaint', err);
        setError('Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'officer',
      senderName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    // TODO: Send message to API
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    if (!complaint) return;

    try {
      const response = await apiClient.updateComplaint(complaint._id, { status: selectedStatus });
      if (response.success && response.data) {
        setComplaint(response.data);
        alert('Status updated successfully!');
      } else {
        alert(response.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status', err);
      alert('Failed to update status');
    }
  };

  const handleSubmitResolution = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }
    if (!complaint) return;

    try {
      const response = await apiClient.updateComplaint(complaint._id, {
        status: 'resolved',
        resolution: resolutionNotes,
      });

      if (response.success && response.data) {
        setComplaint(response.data);
        setSelectedStatus('resolved');
        alert('Resolution submitted successfully!');
      } else {
        alert(response.error || 'Failed to submit resolution');
      }
    } catch (err) {
      console.error('Error submitting resolution', err);
      alert('Failed to submit resolution');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedDocuments([...uploadedDocuments, ...Array.from(e.target.files)]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Complaint Not Found'}
        </h2>
        <Button onClick={() => navigate('/transport/complaints')}>
          Back to Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/transport/complaints')}>
          ← Back to Complaints
        </Button>
        <div className="flex space-x-2">
          <Badge variant={getStatusColor(complaint.status)}>
            {complaint.status.replace('-', ' ').toUpperCase()}
          </Badge>
          <Badge variant={getPriorityColor(complaint.priority)}>
            {complaint.priority.toUpperCase()} PRIORITY
          </Badge>
        </div>
      </div>

      {/* Complaint Details */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {complaint.title}
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Complaint ID
            </h3>
            <p className="text-gray-900 dark:text-white font-mono">#{complaint._id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category
            </h3>
            <p className="text-gray-900 dark:text-white capitalize">{complaint.category}</p>
          </div>
          {complaint.vehicleNumber && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Vehicle Number
              </h3>
              <p className="text-gray-900 dark:text-white">{complaint.vehicleNumber}</p>
            </div>
          )}
          {complaint.route && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Route
              </h3>
              <p className="text-gray-900 dark:text-white">{complaint.route}</p>
            </div>
          )}
          {complaint.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Location
              </h3>
              <p className="text-gray-900 dark:text-white">{complaint.location}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Date & Time
            </h3>
            <p className="text-gray-900 dark:text-white">
              {new Date(complaint.dateTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </h3>
          <p className="text-gray-900 dark:text-white">{complaint.description}</p>
        </div>
      </Card>

      {/* Update Status */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Update Status
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Complaint['status'])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleStatusUpdate} className="w-full">
              Update Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Resolution */}
      {complaint.status !== 'resolved' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Add Resolution
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution Notes *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe how the complaint was resolved..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Resolution Documents (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              {uploadedDocuments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadedDocuments.length} file(s) selected
                  </p>
                </div>
              )}
            </div>

            <Button onClick={handleSubmitResolution} className="w-full">
              Submit Resolution
            </Button>
          </div>
        </Card>
      )}

      {/* Chat with Passenger */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Communication with Passenger
        </h2>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No messages yet. Start a conversation with the passenger.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'officer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'officer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">{message.senderName}</p>
                  <p>{message.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </Card>
    </div>
  );
};
