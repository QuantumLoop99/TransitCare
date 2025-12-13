import { Router } from 'express';
import { Types } from 'mongoose';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { prioritizeComplaint } from '../utils/prioritizeComplaint.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, sort = 'createdAt', order = 'desc', status, priority, category, userEmail, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userEmail) filter.submittedBy = userEmail;
    if (assignedTo) {
      const ids = Array.isArray(assignedTo)
        ? assignedTo
        : String(assignedTo)
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
      if (ids.length === 1) {
        filter.assignedTo = ids[0];
      } else if (ids.length > 1) {
        filter.assignedTo = { $in: ids };
      }
    }

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'firstName lastName')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();

    setTimeout(async () => {
      try {
        const analysis = await prioritizeComplaint(complaint);
        await Complaint.findByIdAndUpdate(complaint._id, {
          priority: analysis.priority,
          aiAnalysis: analysis,
        });
      } catch (error) {
        console.error('AI prioritization failed:', error);
      }
    }, 100);

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('assignedTo', 'firstName lastName');
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    return res.json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const oldComplaint = await Complaint.findById(req.params.id);
    if (!oldComplaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'firstName lastName');

    if (req.body.status && oldComplaint.status !== req.body.status) {
      const notification = new Notification({
        userId: oldComplaint.submittedBy,
        complaintId: oldComplaint._id,
        type: req.body.status === 'resolved' || req.body.status === 'closed' ? 'resolved' : 'status_change',
        title: 'Complaint Status Updated',
        message: `Your complaint "${oldComplaint.title}" status changed from ${oldComplaint.status} to ${req.body.status}`,
        metadata: {
          oldStatus: oldComplaint.status,
          newStatus: req.body.status,
        },
      });
      await notification.save();
    }

    return res.json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/messages', async (req, res) => {
  try {
    const { sender, senderId, message } = req.body;

    if (!sender || !senderId || !message) {
      return res.status(400).json({ success: false, error: 'Missing sender, senderId, or message' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const newMessage = { sender, senderId, message };
    complaint.messages.push(newMessage);
    await complaint.save();

    const savedComplaint = await Complaint.findById(req.params.id)
      .select({ messages: { $slice: -1 } })
      .populate('messages.senderId', 'firstName lastName role');

    if (sender === 'officer' || sender === 'admin') {
      const senderUser = await User.findById(senderId);
      const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : 'Officer';

      const notification = new Notification({
        userId: complaint.submittedBy,
        complaintId: complaint._id,
        type: 'new_message',
        title: 'New Message on Your Complaint',
        message: `${senderName} sent a message on your complaint "${complaint.title}"`,
        metadata: {
          senderName,
          senderRole: sender,
        },
      });
      await notification.save();
    }

    return res.json({ success: true, data: savedComplaint.messages[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('messages.senderId', 'firstName lastName role');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    return res.json({ success: true, data: complaint.messages });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedTo, status } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'Officer ID (assignedTo) is required',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found',
      });
    }

    let officerId = assignedTo;
    if (typeof assignedTo === 'string' && Types.ObjectId.isValid(assignedTo)) {
      officerId = new Types.ObjectId(assignedTo);
    }

    complaint.assignedTo = officerId;
    complaint.status = status || 'in-progress';
    await complaint.save();

    await complaint.populate('assignedTo', 'firstName lastName');

    return res.json({
      success: true,
      data: complaint,
      message: 'Complaint successfully reassigned',
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.post('/:id/prioritize', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const analysis = await prioritizeComplaint(complaint);

    complaint.priority = analysis.priority;
    complaint.aiAnalysis = analysis;
    await complaint.save();

    return res.json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ success: false, error: 'Rating is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    complaint.feedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date(),
    };

    await complaint.save();

    return res.json({ success: true, data: complaint });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/feedback', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).select('feedback');
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    return res.json({ success: true, data: complaint.feedback || null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
