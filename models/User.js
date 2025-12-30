
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  domain: { type: String, default: 'Exploration' },
  university: String,
  year: String,
  bio: { type: String, default: '' },
  skills: [String],
  achievements: [String],
  role: { type: String, enum: ['student', 'admin', 'guest'], default: 'student' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  profileImage: String, // Base64 Data
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    badges: { type: Array, default: [] }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
