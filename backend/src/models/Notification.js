import { mongoose } from '../config/db.js';

const { Schema, model } = mongoose;

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

const Notification = model('Notification', notificationSchema);

export default Notification;
