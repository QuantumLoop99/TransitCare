import { mongoose } from '../config/db.js';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['passenger', 'officer', 'admin'], default: 'passenger' },
  clerkId: String,
}, {
  timestamps: true,
});

const User = model('User', userSchema);

export default User;
