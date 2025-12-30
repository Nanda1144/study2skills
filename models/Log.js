
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  userName: String,
  action: { type: String, required: true },
  details: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);
