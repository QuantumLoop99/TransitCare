/**
 * TransitCare Backend Server (Reference Implementation)
 * 
 * This is a reference implementation showing the backend structure.
 * In a real deployment, this would be in a separate repository.
 */

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
const { connect, Schema, model, connection: mongooseConnection } = mongoose;
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import 'dotenv/config';



const app = express();
const PORT = process.env.PORT || 3001;

// Prevent crashes from unhandled promise rejections/exceptions in dev
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled promise rejection (suppressed):', reason instanceof Error ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Uncaught exception (suppressed):', err?.message || err);
});

// Middleware
app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// MongoDB Connection (safe)
const MONGO_URI = process.env.MONGODB_URI;
(async () => {
  if (!MONGO_URI) {
    console.warn('MONGODB_URI not set; running without a database. Some endpoints will be limited.');
    return;
  }
  try {
    await connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB connection failed:', err?.message || err);
    console.warn('Continuing to run API without DB. Endpoints that require DB will be limited.');
  }
})();
mongooseConnection.on('error', (err) => {
  console.warn('MongoDB connection error (non-fatal):', err?.message || err);
});

// OpenAI Configuration (optional)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your_openai_api_key') {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize OpenAI client:', err.message);
    openai = null;
  }
} else {
  console.warn('OPENAI_API_KEY not set or is placeholder; AI features disabled.');
}

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

const Complaint = model('Complaint', complaintSchema);
const User = model('User', userSchema);

// In-memory fallback for dev when DB is unavailable
const memory = {
  users: new Map(), // key: clerkId
};
function isDbConnected() {
  return mongooseConnection && mongooseConnection.readyState === 1;
}

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
    if (!openai) {
      // OpenAI not configured; return a safe default analysis
      return {
        priority: 'medium',
        reasoning: 'AI disabled or misconfigured, defaulting to medium',
        sentiment: 0,
        confidence: 0,
      };
    }

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
    const { limit = 10, sort = 'createdAt', order = 'desc', status, priority, category, userEmail } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userEmail) filter.submittedBy = userEmail; // restrict by owner

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

// Assign or reassign complaint to an officer
app.patch('/api/complaints/:id/assign', async (req, res) => {
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

    // Update complaint
    complaint.assignedTo = assignedTo;
    complaint.status = status || 'in-progress';
    await complaint.save();

    res.json({
      success: true,
      data: complaint,
      message: 'Complaint successfully reassigned',
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
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
    if (!isDbConnected()) {
      return res.json({ success: true, data: Array.from(memory.users.values()), meta: { storage: 'memory' } });
    }
    const users = await User.find().select('-__v');
    res.json({ success: true, data: users, meta: { storage: 'db' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
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
      if (doc.clerkId) memory.users.set(doc.clerkId, doc);
      return res.json({ success: true, data: doc, meta: { storage: 'memory' } });
    }
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, data: user, meta: { storage: 'db' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Onboard endpoint: called after a Clerk sign-in/sign-up to upsert local user
app.post('/api/users/onboard', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;
    if (!clerkId || !email) {
      return res.status(400).json({ success: false, error: 'Missing clerkId or email' });
    }

    if (!isDbConnected()) {
      const existing = memory.users.get(clerkId);
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
      memory.users.set(clerkId, updated);
      return res.json({ success: true, data: updated, meta: { storage: 'memory' } });
    }

    // Try to find existing user first
    let user = await User.findOne({ clerkId });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.firstName = firstName || user.firstName || '';
      user.lastName = lastName || user.lastName || '';
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        clerkId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'passenger'
      });
    }

    res.json({ success: true, data: user, meta: { storage: 'db' } });
  } catch (error) {
    console.error('Onboard error:', error.message, error.stack);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

// Admin middleware: simple check using ADMIN_SECRET header for dev/testing.
function requireAdmin(req, res, next) {
  try {
    const adminSecret = req.header('x-admin-secret');
    if (adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET) {
      return next();
    }

    return res.status(403).json({ success: false, error: 'Unauthorized: missing or invalid admin secret' });
  } catch (error) {
    console.error('requireAdmin error', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Admin: create a Clerk user and local user (invite flow)
app.post('/api/admin/create-user', requireAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    if (!email || !role) return res.status(400).json({ success: false, error: 'Missing fields' });

    if (!process.env.CLERK_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server not configured with CLERK_API_KEY' });
    }

    // Create Clerk user via Clerk REST API
    const clerkResp = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_addresses: [{ email_address: email }],
        first_name: firstName,
        last_name: lastName,
      })
    });

    if (!clerkResp.ok) {
      const text = await clerkResp.text();
      console.error('Clerk API error', clerkResp.status, text);
      return res.status(500).json({ success: false, error: 'Clerk API error' });
    }

    const clerkUser = await clerkResp.json();
    const clerkId = clerkUser.id || clerkUser?.user?.id;

    if (!clerkId) {
      console.error('Unexpected Clerk response', clerkUser);
      return res.status(500).json({ success: false, error: 'Invalid Clerk response' });
    }

    const localUser = new User({
      email,
      firstName,
      lastName,
      role,
      clerkId,
    });

    await localUser.save();

    res.json({ success: true, data: { localUser, clerkUser } });
  } catch (error) {
    console.error('create-user error', error);
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
    dbConnected: isDbConnected(),
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
app.use((req, res) => {
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