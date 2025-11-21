/**
 * TransitCare Backend Server (Reference Implementation)
 * 
 * This is a reference implementation showing the backend structure.
 * In a real deployment, this would be in a separate repository.
 */

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
const { connect, Schema, model, connection: mongooseConnection, Types } = mongoose;
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

//Safe JSON parser that ignores empty bodies (fixes GET /api/users?role=officer)
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }
  express.json({ limit: '10mb', strict: false })(req, res, next);
});

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
const messageSchema = new Schema({
  sender: { type: String, enum: ['passenger', 'officer', 'admin'], required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

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
  resolutionNotes: String,
  resolutionDate: Date,
  aiAnalysis: {
    priority: String,
    sentiment: Number,
    category: String,
    confidence: Number,
    reasoning: String,
  },
  messages: [messageSchema]
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

const notificationSchema = new Schema({
  userId: { type: String, required: true },
  complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
  type: { type: String, enum: ['status_change', 'new_message', 'resolved'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  metadata: {
    oldStatus: String,
    newStatus: String,
    senderName: String,
    senderRole: String,
  },
}, {
  timestamps: true,
});

const Complaint = model('Complaint', complaintSchema);
const User = model('User', userSchema);
const Notification = model('Notification', notificationSchema);

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
    // Only log non-quota errors in detail
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.warn('OpenAI API quota exceeded, using default priority');
    } else {
      console.error('OpenAI API error:', error.message || error);
    }
    return {
      priority: 'medium',
      reasoning: 'AI analysis unavailable, using default priority',
      sentiment: 0,
      confidence: 0,
    };
  }
}

// Routes

// Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const { limit = 10, sort = 'createdAt', order = 'desc', status, priority, category, userEmail, assignedTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userEmail) filter.submittedBy = userEmail; // restrict by owner
    if (assignedTo) {
      const ids = Array.isArray(assignedTo)
        ? assignedTo
        : String(assignedTo)
            .split(',')
            .map(id => id.trim())
            .filter(Boolean);
      if (ids.length === 1) {
        filter.assignedTo = ids[0];
      } else if (ids.length > 1) {
        filter.assignedTo = { $in: ids };
      }
    }

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'firstName lastName')
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
    const complaint = await Complaint.findById(req.params.id).populate('assignedTo', 'firstName lastName');
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
    const oldComplaint = await Complaint.findById(req.params.id);
    if (!oldComplaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'firstName lastName');
    
    // Create notification if status changed
    if (req.body.status && oldComplaint.status !== req.body.status) {
      const notification = new Notification({
        userId: oldComplaint.submittedBy,
        complaintId: oldComplaint._id,
        type: req.body.status === 'resolved' || req.body.status === 'closed' ? 'resolved' : 'status_change',
        title: `Complaint Status Updated`,
        message: `Your complaint "${oldComplaint.title}" status changed from ${oldComplaint.status} to ${req.body.status}`,
        metadata: {
          oldStatus: oldComplaint.status,
          newStatus: req.body.status,
        },
      });
      await notification.save();
    }
    
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a message to a complaint
app.post('/api/complaints/:id/messages', async (req, res) => {
  try {
    const { sender, senderId, message } = req.body;

    if (!sender || !senderId || !message) {
      return res.status(400).json({ success: false, error: 'Missing sender, senderId, or message' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const newMessage = { sender, senderId, message };
    complaint.messages.push(newMessage);
    await complaint.save();

    const savedComplaint = await Complaint.findById(req.params.id)
      .select({ messages: { $slice: -1 } })
      .populate('messages.senderId', 'firstName lastName role');

    // Create notification if officer sent the message to passenger
    if (sender === 'officer' || sender === 'admin') {
      const senderUser = await User.findById(senderId);
      const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : 'Officer';
      
      const notification = new Notification({
        userId: complaint.submittedBy,
        complaintId: complaint._id,
        type: 'new_message',
        title: 'New Message on Your Complaint',
        message: `${senderName} sent a message on your complaint "${complaint.title}"`,
        metadata: {
          senderName: senderName,
          senderRole: sender,
        },
      });
      await notification.save();
    }

    res.json({ success: true, data: savedComplaint.messages[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Get messages for a complaint
app.get('/api/complaints/:id/messages', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('messages.senderId', 'firstName lastName role');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint.messages });
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

    // Convert assignedTo to ObjectId if it's a valid string ID
    let officerId = assignedTo;
    if (typeof assignedTo === 'string' && Types.ObjectId.isValid(assignedTo)) {
      officerId = new Types.ObjectId(assignedTo);
    }

    // Update complaint
    complaint.assignedTo = officerId;
    complaint.status = status || 'in-progress';
    await complaint.save();

    // Populate assignedTo before sending response
    await complaint.populate('assignedTo', 'firstName lastName');

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
    const { role } = req.query; // Read query parameter: ?role=officer

    let query = {};
    if (role) {
      query.role = role; // Filter by role if provided
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

    // Try to find existing user by clerkId OR email
    let user = await User.findOne({ $or: [{ clerkId }, { email }] });
    
    if (user) {
      // Update existing user
      user.clerkId = clerkId; // Update clerkId in case user was found by email only
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
    // Handle duplicate key error specifically
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


// Notifications
app.get('/api/notifications', async (req, res) => {
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

    res.json({ 
      success: true, 
      data: notifications,
      unreadCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail is required' });
    }

    await Notification.updateMany(
      { userId: userEmail, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
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
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Migration endpoint: Convert string assignedTo to ObjectId references
app.post('/api/migrate/fix-assigned-to', async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: { $type: 'string' } });
    let updated = 0;

    for (const complaint of complaints) {
      if (Types.ObjectId.isValid(complaint.assignedTo)) {
        complaint.assignedTo = new Types.ObjectId(complaint.assignedTo);
        await complaint.save();
        updated++;
      }
    }

    res.json({
      success: true,
      message: `Successfully migrated ${updated} complaints`,
      updated
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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