/**
 * TransitCare Backend Server (Reference Implementation)
 * 
 * This is a reference implementation showing the backend structure.
 * In a real deployment, this would be in a separate repository.
 */

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { connect, Schema, model as _model } from 'mongoose';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// MongoDB Connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transitcare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Models
const complaintSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved', 'closed'], default: 'pending' },
  vehicleNumber: String,
  route: String,
  dateTime: { type: Date, required: true },
  location: String,
  attachments: [String],
  submittedBy: { type: String, required: true },
  assignedTo: String,
  resolution: String,
  aiAnalysis: {
    priority: String,
    sentiment: Number,
    category: String,
    confidence: Number,
    reasoning: String,
  },
}, {
  timestamps: true,
});

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['passenger', 'officer', 'admin'], default: 'passenger' },
  clerkId: String,
}, {
  timestamps: true,
});

const Complaint = _model('Complaint', complaintSchema);
const User = _model('User', userSchema);

// AI Prioritization Function
async function prioritizeComplaint(complaint) {
  const prompt = `
    Analyze this public transport complaint and determine its priority level:

    Title: ${complaint.title}
    Description: ${complaint.description}
    Category: ${complaint.category}
    Date: ${complaint.dateTime}
    Location: ${complaint.location || 'Not specified'}
    Vehicle: ${complaint.vehicleNumber || 'Not specified'}

    Consider factors like:
    - Safety implications
    - Service disruption impact
    - Number of affected passengers
    - Urgency of resolution needed
    - Emotional sentiment of the complaint

    Respond with JSON only:
    {
      "priority": "high|medium|low",
      "reasoning": "brief explanation",
      "sentiment": -1 to 1,
      "confidence": 0 to 1,
      "suggestedCategory": "suggested category if different"
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in analyzing public transport complaints. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      priority: 'medium',
      reasoning: 'AI analysis failed, using default priority',
      sentiment: 0,
      confidence: 0,
    };
  }
}

// Routes

// Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const { limit = 10, sort = 'createdAt', order = 'desc', status, priority, category } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();

    // Trigger AI prioritization asynchronously
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

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/complaints/:id/prioritize', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const analysis = await prioritizeComplaint(complaint);
    
    complaint.priority = analysis.priority;
    complaint.aiAnalysis = analysis;
    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ 
      status: { $in: ['resolved', 'closed'] } 
    });

    const priorityBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = {
      high: 0,
      medium: 0,
      low: 0,
    };

    priorityBreakdown.forEach(item => {
      priorityStats[item._id] = item.count;
    });

    // Calculate average resolution time (placeholder calculation)
    const averageResolutionTime = 24; // hours

    res.json({
      success: true,
      data: {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        averageResolutionTime,
        priorityBreakdown: priorityStats,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reports
app.get('/api/reports/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let data = {};

    switch (type) {
      case 'complaints-by-category':
        data = await Complaint.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          }
        ]);
        break;
      
      case 'resolution-time':
        // Placeholder implementation
        data = [
          { period: 'Week 1', averageTime: 18 },
          { period: 'Week 2', averageTime: 22 },
          { period: 'Week 3', averageTime: 16 },
          { period: 'Week 4', averageTime: 20 },
        ];
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid report type' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'TransitCare API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TransitCare API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;