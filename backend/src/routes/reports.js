import { Router } from 'express';
import Complaint from '../models/Complaint.js';

const router = Router();

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, category, status } = req.query;

    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    let data = {};

    switch (type) {
      case 'complaints-by-category':
        data = await Complaint.aggregate([
          { $match: filter },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        break;

      case 'complaints-by-priority':
        data = await Complaint.aggregate([
          { $match: filter },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        break;

      case 'complaints-by-status':
        data = await Complaint.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        break;

      case 'monthly-trends':
        data = await Complaint.aggregate([
          { $match: filter },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          {
            $project: {
              period: {
                $concat: [
                  { $toString: '$_id.year' },
                  '-',
                  { $toString: '$_id.month' },
                ],
              },
              count: 1,
              _id: 0,
            },
          },
        ]);
        break;

      case 'resolution-times':
        data = await Complaint.aggregate([
          {
            $match: {
              ...filter,
              status: { $in: ['resolved', 'closed'] },
              resolutionDate: { $exists: true },
            },
          },
          {
            $addFields: {
              resolutionTime: {
                $subtract: [
                  { $dateFromString: { dateString: '$resolutionDate' } },
                  '$createdAt',
                ],
              },
            },
          },
          {
            $group: {
              _id: '$priority',
              averageTime: {
                $avg: {
                  $divide: ['$resolutionTime', 1000 * 60 * 60],
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              priority: '$_id',
              averageTimeHours: { $round: ['$averageTime', 2] },
              count: 1,
              _id: 0,
            },
          },
        ]);
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid report type' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
