
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Model Imports
const User = require('./models/User');
const DataSync = require('./models/DataSync');
const Log = require('./models/Log');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study2skills';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('🚀 MongoDB Connected: Cluster Active'))
  .catch(err => console.error('❌ Cluster Connection Error:', err));

// --- API ROUTES ---

// Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      email: req.body.email, 
      passwordHash: req.body.password 
    });
    if (!user) return res.status(404).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Automated Data Sync (Upsert Logic)
app.post('/api/data/:userId/:collection', async (req, res) => {
  try {
    const { userId, collection } = req.params;
    const entry = await DataSync.findOneAndUpdate(
      { userId, collectionName: collection },
      { payload: req.body.data, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    res.json(entry.payload);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/data/:userId/:collection', async (req, res) => {
  try {
    const entry = await DataSync.findOne({ 
      userId: req.params.userId, 
      collectionName: req.params.collection 
    });
    res.json(entry ? entry.payload : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Control Endpoints
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const domainDist = await User.aggregate([
      { $group: { _id: "$domain", value: { $sum: 1 } } }
    ]);
    res.json({
      totalUsers,
      activeUsers: totalUsers,
      growth: 15.2,
      domainDistribution: domainDist.map(d => ({ name: d._id || 'Unset', value: d.value }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Logging
app.post('/api/logs', async (req, res) => {
  try {
    const log = new Log(req.body);
    await log.save();
    res.sendStatus(201);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`  STUDY2SKILLS MONGODB BRIDGE IS LIVE`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Sync: Automated / Real-time`);
  console.log(`--------------------------------------------------`);
});
