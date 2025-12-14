import { Router } from 'express';
import Settings, { getSetting, setSetting } from '../models/Settings.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = Router();

// Get all settings
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.find().sort({ category: 1, key: 1 });
    
    // Convert to key-value format for easier frontend consumption
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });
    
    res.json({ success: true, data: settingsObject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update multiple settings
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { settings, updatedBy } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, error: 'Settings object is required' });
    }
    
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      try {
        const setting = await setSetting(key, value, updatedBy);
        results.push({ key, success: true, setting });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific setting
router.get('/settings/:key', requireAdmin, async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    
    if (value === null) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    
    res.json({ success: true, data: { key: req.params.key, value } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a specific setting
router.put('/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { value, updatedBy } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ success: false, error: 'Value is required' });
    }
    
    const setting = await setSetting(req.params.key, value, updatedBy);
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;