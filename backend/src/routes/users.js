import { Router } from 'express';
import { Types } from 'mongoose';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { role, id, email, _id } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }
    if (id) {
      query.$or = [{ _id: id }, { email: id }];
    }
    if (email) {
      query.email = email;
    }
    if (_id) {
      query._id = _id;
    }

    const users = await User.find(query);

    res.json({
      success: true,
      data: users,
      meta: { count: users.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;

    if (Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    }

    if (!user) {
      user = await User.findOne({ email: id });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const body = req.body || {};
      const doc = {
        _id: 'mem-' + Date.now(),
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || 'passenger',
        clerkId: body.clerkId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (doc.clerkId) memoryStore.users.set(doc.clerkId, doc);
      return res.json({ success: true, data: doc, meta: { storage: 'memory' } });
    }
    const user = new User(req.body);
    await user.save();
    return res.json({ success: true, data: user, meta: { storage: 'db' } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Officer stats endpoint
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid officer ID' });
    }

    // Use MongoDB aggregation to efficiently compute officer statistics
    const stats = await Complaint.aggregate([
      {
        $match: {
          assignedTo: id
        }
      },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          resolvedComplaints: {
            $sum: {
              $cond: [
                { $in: ['$status', ['resolved', 'closed']] },
                1,
                0
              ]
            }
          },
          ratingSum: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$feedback.rating', null] },
                  { $in: ['$status', ['resolved', 'closed']] }
                ]},
                '$feedback.rating',
                0
              ]
            }
          },
          ratingCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$feedback.rating', null] },
                  { $in: ['$status', ['resolved', 'closed']] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAssigned: 0,
      resolvedComplaints: 0,
      ratingSum: 0,
      ratingCount: 0
    };

    const averageRating = result.ratingCount > 0 ? 
      Number((result.ratingSum / result.ratingCount).toFixed(1)) : 0;

    return res.json({
      success: true,
      data: {
        totalAssignedComplaints: result.totalAssigned,
        resolvedComplaints: result.resolvedComplaints,
        averageRating: averageRating
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/onboard', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;
    if (!clerkId || !email) {
      return res.status(400).json({ success: false, error: 'Missing clerkId or email' });
    }

    if (!isDbConnected()) {
      const existing = memoryStore.users.get(clerkId);
      const updated = {
        _id: existing?._id || ('mem-' + Date.now()),
        clerkId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: existing?.role || 'passenger',
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(clerkId, updated);
      return res.json({ success: true, data: updated, meta: { storage: 'memory' } });
    }

    let user = await User.findOne({ $or: [{ clerkId }, { email }] });

    if (user) {
      user.clerkId = clerkId;
      user.email = email;
      user.firstName = firstName || user.firstName || '';
      user.lastName = lastName || user.lastName || '';
      await user.save();
    } else {
      user = await User.create({
        clerkId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'passenger'
      });
    }

    return res.json({ success: true, data: user, meta: { storage: 'db' } });
  } catch (error) {
    if (error.code === 11000) {
      console.warn('Duplicate key error during onboard, attempting to find and update existing user');
      try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          user.clerkId = req.body.clerkId;
          user.firstName = req.body.firstName || user.firstName || '';
          user.lastName = req.body.lastName || user.lastName || '';
          await user.save();
          return res.json({ success: true, data: user, meta: { storage: 'db', recovered: true } });
        }
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError.message);
      }
    }
    console.error('Onboard error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

export default router;
