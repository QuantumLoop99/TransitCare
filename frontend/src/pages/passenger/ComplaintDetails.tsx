import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { apiClient } from '../../lib/api';
import { Complaint } from '../../types';

interface Message {
  id: string;
  sender: 'passenger' | 'officer' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

interface StatusUpdate {
  status: string;
  timestamp: string;
  note?: string;
}

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusTimeline, setStatusTimeline] = useState<StatusUpdate[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // ✅ Fetch real complaint data from backend
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const response = await apiClient.getComplaint(id);
        if (response.success && response.data) {
          setComplaint(response.data);
          // Optionally generate a placeholder status timeline (until backend supports it)
          setStatusTimeline([
            { status: response.data.status, timestamp: response.data.createdAt, note: 'Complaint created' }
          ]);
        } else {
          setComplaint(null);
        }
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        setComplaint(null);
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
      sender: 'passenger',
      senderName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    // TODO: Send message to API
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0 || !id) return;
    
    try {
      const feedbackData = {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      };
      
      const response = await apiClient.submitComplaintFeedback(id, feedbackData);
      
      if (response.success && response.data) {
        // Update the complaint state with the new feedback
        setComplaint(response.data);
        setFeedbackRating(0);
        setFeedbackComment('');
        alert('Thank you for your feedback!');
      } else {
        alert(response.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Priority badge temporarily disabled; re-enable when needed.

  // ✅ Loading and fallback states
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Complaint Not Found
        </h2>
        <Button onClick={() => navigate('/passenger/complaints')}>
          Back to My Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/passenger/complaints')}>
          ← Back to Complaints
        </Button>
        <div className="flex space-x-2">
          <Badge variant={getStatusColor(complaint.status)}>
            {complaint.status.replace('-', ' ').toUpperCase()}
          </Badge>
          {/* <Badge variant={getPriorityColor(complaint.priority)}>
            {complaint.priority.toUpperCase()} PRIORITY
          </Badge> */}
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
          {complaint.assignedTo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assigned To
              </h3>
              <p className="text-gray-900 dark:text-white">
                {typeof complaint.assignedTo === 'object' 
                  ? `${(complaint.assignedTo as any).firstName || ''} ${(complaint.assignedTo as any).lastName || ''}`.trim()
                  : complaint.assignedTo}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </h3>
          <p className="text-gray-900 dark:text-white">{complaint.description}</p>
        </div>

        {complaint.attachments && complaint.attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Evidence
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {complaint.attachments.map((attachment, index) => (
                <div key={index} className="border rounded-lg p-2 cursor-pointer hover:shadow-md">
                  <img
                    src={attachment}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Status Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Status Timeline
        </h2>
        <div className="space-y-4">
          {statusTimeline.map((update, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                ✓
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {update.status.replace('-', ' ')}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(update.timestamp).toLocaleString()}
                  </span>
                </div>
                {update.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{update.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resolution Notes - Display for resolved complaints */}
      {complaint.status === 'resolved' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
            Resolution Notes
          </h2>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            {(complaint.resolution || complaint.resolutionNotes) ? (
              <>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-3">
                  {complaint.resolution || complaint.resolutionNotes}
                </p>
                {complaint.resolutionDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-green-200 dark:border-green-800">
                    Resolved on {new Date(complaint.resolutionDate).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                This complaint has been resolved.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Feedback Display - For admins and officers viewing resolved complaints */}
      {complaint.status === 'resolved' && complaint.feedback && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-blue-600 dark:text-blue-400 mr-2">💬</span>
            Passenger Feedback
          </h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-3">
              <div className="flex items-center space-x-1 mr-4">
                <span className="text-lg font-medium text-gray-900 dark:text-white">Rating:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${
                        star <= complaint.feedback!.rating 
                          ? 'text-yellow-500' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                    ({complaint.feedback.rating}/5)
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Submitted on {new Date(complaint.feedback.submittedAt).toLocaleString()}
              </span>
            </div>
            {complaint.feedback.comment && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments:
                </p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {complaint.feedback.comment}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Messages */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No messages yet. Start a conversation with the transport representative.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'passenger'
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

      {/* Feedback Form */}
      {complaint.status === 'resolved' && !complaint.feedback && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Provide Feedback
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            How satisfied are you with the resolution?
          </p>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedbackRating(star)}
                className={`text-3xl ${
                  star <= feedbackRating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Additional comments (optional)"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
          />
          <Button onClick={handleSubmitFeedback} disabled={feedbackRating === 0}>
            Submit Feedback
          </Button>
        </Card>
      )}
    </div>
  );
};
