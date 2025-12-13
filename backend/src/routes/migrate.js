import { Router } from 'express';
import { Types } from 'mongoose';
import Complaint from '../models/Complaint.js';

const router = Router();

router.post('/fix-assigned-to', async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: { $type: 'string' } });
    let updated = 0;

    for (const complaint of complaints) {
      if (Types.ObjectId.isValid(complaint.assignedTo)) {
        complaint.assignedTo = new Types.ObjectId(complaint.assignedTo);
        await complaint.save();
        updated += 1;
      }
    }

    return res.json({
      success: true,
      message: `Successfully migrated ${updated} complaints`,
      updated,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
