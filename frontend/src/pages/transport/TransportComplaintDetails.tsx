import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Complaint } from '../../types';
import { apiClient } from '../../lib/api';

interface Message {
  _id?: string;
  id?: string;
  sender: 'passenger' | 'officer' | 'admin';
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt?: string;
  timestamp?: string;
}

export const TransportComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Complaint['status']>('pending');
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Read-only mode for history page
  const isReadOnly = searchParams.get('readonly') === 'true';

  // Fetch complaint
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

  // 📨 Fetch messages (auto-refresh every 5s)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;
      try {
        const res = await apiClient.getComplaintMessages(id);
        if (res.success && res.data) setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // 📨 Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    const officerId = localStorage.getItem('userId') || undefined;


    const localMsg: Message = {
      id: Date.now().toString(),
      sender: 'officer',
      senderName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
    setNewMessage('');

    try {
      await apiClient.postComplaintMessage(id, {
        sender: 'officer',
        senderId: localStorage.getItem('userId') || undefined,
        message: newMessage.trim(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus || !complaint) return;
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

  // Submit resolution
  const handleSubmitResolution = async () => {
    if (!resolutionNotes.trim() || !complaint) {
      alert('Please provide resolution notes');
      return;
    }
    try {
      const response = await apiClient.updateComplaint(complaint._id, {
        status: 'resolved',
        resolution: resolutionNotes,
        resolutionNotes: resolutionNotes,
        resolutionDate: new Date().toISOString(),
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
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Complaint ID</h3>
            <p className="text-gray-900 dark:text-white font-mono">#{complaint._id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
            <p className="text-gray-900 dark:text-white capitalize">{complaint.category}</p>
          </div>
        </div>

        <p className="text-gray-900 dark:text-white">{complaint.description}</p>
      </Card>

      {/* Chat */}
      {!isReadOnly && (
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
              messages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className={`flex ${msg.sender === 'officer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-lg ${
                      msg.sender === 'officer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">
                      {(() => {
                        const currentUserId = localStorage.getItem('userId') || undefined;
                        const currentEmail = localStorage.getItem('userEmail') || undefined;

                        const assignedOfficerEmail =
                          complaint && typeof complaint.assignedTo === 'object'
                            ? (complaint.assignedTo as any).email
                            : undefined;

                        // Detect if this message was sent by *me*
                        const authoredByMe =
                          (msg.senderId && currentUserId && msg.senderId === currentUserId) ||
                          (msg.sender === 'officer' &&
                            currentEmail &&
                            assignedOfficerEmail &&
                            currentEmail === assignedOfficerEmail) ||
                          (msg.senderName === 'You'); // Check for optimistic local messages

                        if (authoredByMe) return 'You';
                        if (msg.senderName?.trim() && msg.senderName !== 'You') return msg.senderName;
                        if (msg.sender === 'passenger') return 'Passenger';
                        if (msg.sender === 'admin') return 'Admin';
                        return 'Officer';
                      })()}
                    </p>
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleString()}
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
      )}
    </div>
  );
};
