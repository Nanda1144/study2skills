
const mongoose = require('mongoose');

const DataSyncSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  collectionName: { 
    type: String, 
    required: true, 
    enum: ['roadmap', 'roadmap_history', 'resume_versions', 'job_history', 'interview_history', 'saved_jobs', 'user_portfolio', 'completed_courses'] 
  },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

// Optimization: Ensure unique index per user per data type for fast atomic updates
DataSyncSchema.index({ userId: 1, collectionName: 1 }, { unique: true });

module.exports = mongoose.model('DataSync', DataSyncSchema);
