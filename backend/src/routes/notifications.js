import { Router } from 'express';
import Notification from '../models/Notification.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userEmail, unreadOnly } = req.query;

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail is required' });
    }

    const filter = { userId: userEmail };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('complaintId', 'title status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId: userEmail, isRead: false });

    return res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/mark-all-read', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail is required' });
    }

    await Notification.updateMany(
      { userId: userEmail, isRead: false },
      { isRead: true }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
