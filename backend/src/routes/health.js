import { Router } from 'express';
import { isDbConnected } from '../config/db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TransitCare API is running',
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
