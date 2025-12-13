import { Router } from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: { $in: ['resolved', 'closed'] } });

    const priorityBreakdown = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityStats = { high: 0, medium: 0, low: 0 };
    priorityBreakdown.forEach((item) => {
      priorityStats[item._id] = item.count;
    });

    const resolvedDocs = await Complaint.find({ status: { $in: ['resolved', 'closed'] } })
      .select('createdAt updatedAt resolutionDate');
    const resolutionDurations = resolvedDocs
      .map((doc) => {
        const start = doc.createdAt;
        const end = doc.resolutionDate || doc.updatedAt;
        if (!start || !end) return null;
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      })
      .filter((v) => v !== null);
    const averageResolutionTime = resolutionDurations.length
      ? Math.round((resolutionDurations.reduce((s, h) => s + (h || 0), 0) / resolutionDurations.length) * 10) / 10
      : 0;

    const totalRegisteredOfficers = await User.countDocuments({ role: 'officer' });
    const activeOfficerAgg = await Complaint.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: '' }, status: { $in: ['pending', 'in-progress'] } } },
      { $addFields: {
        assigneeObjectId: {
          $cond: {
            if: { $eq: [{ $type: '$assignedTo' }, 'string'] },
            then: { $toObjectId: '$assignedTo' },
            else: '$assignedTo',
          }
        }
      }},
      { $lookup: { from: 'users', localField: 'assigneeObjectId', foreignField: '_id', as: 'assigneeUser' } },
      { $unwind: '$assigneeUser' },
      { $match: { 'assigneeUser.role': 'officer' } },
      { $group: { _id: '$assigneeUser._id' } },
      { $count: 'count' },
    ]);
    const activeAssignedOfficers = activeOfficerAgg[0]?.count || 0;

    const percentOfTotal = (count = 0) => (totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0);

    res.json({
      success: true,
      data: {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        averageResolutionTime,
        priorityBreakdown: priorityStats,
        activeOfficers: totalRegisteredOfficers,
        totals: { registeredOfficers: totalRegisteredOfficers },
        percentages: {
          pending: percentOfTotal(pendingComplaints),
          resolved: percentOfTotal(resolvedComplaints),
          highPriority: percentOfTotal(priorityStats.high),
          mediumPriority: percentOfTotal(priorityStats.medium),
          lowPriority: percentOfTotal(priorityStats.low),
        },
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
