import { mongoose } from '../config/db.js';

const { Schema, model } = mongoose;

const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
  category: { type: String, default: 'system' },
  updatedBy: { type: String },
}, {
  timestamps: true,
});

const Settings = model('Settings', settingsSchema);

// Helper function to get a setting value
export async function getSetting(key, defaultValue = null) {
  try {
    const setting = await Settings.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error('Error getting setting:', error);
    return defaultValue;
  }
}

// Helper function to set a setting value
export async function setSetting(key, value, updatedBy = null, description = null) {
  try {
    const setting = await Settings.findOneAndUpdate(
      { key },
      { 
        value, 
        updatedBy, 
        ...(description && { description })
      },
      { upsert: true, new: true }
    );
    return setting;
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
}

// Initialize default settings
export async function initializeDefaultSettings() {
  const defaults = [
    {
      key: 'aiPrioritization',
      value: true,
      description: 'Enable AI-powered complaint prioritization',
      category: 'ai'
    },
    {
      key: 'autoAssignment',
      value: true,
      description: 'Enable automatic complaint assignment',
      category: 'system'
    },
    {
      key: 'maintenanceMode',
      value: false,
      description: 'Enable maintenance mode',
      category: 'system'
    }
  ];

  for (const defaultSetting of defaults) {
    const existing = await Settings.findOne({ key: defaultSetting.key });
    if (!existing) {
      await new Settings(defaultSetting).save();
      console.log(`Initialized default setting: ${defaultSetting.key}`);
    }
  }
}

export default Settings;