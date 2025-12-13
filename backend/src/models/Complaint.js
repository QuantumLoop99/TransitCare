import { mongoose } from '../config/db.js';

const { Schema, model } = mongoose;

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
  messages: [messageSchema],
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date },
  }
}, {
  timestamps: true,
});

const Complaint = model('Complaint', complaintSchema);

export default Complaint;
