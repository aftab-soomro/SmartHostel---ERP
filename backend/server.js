// ====== CRITICAL: Force IPv4 DNS globally for Render.com ======
// Must be at the very top before any requires or DNS lookups
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const authRouter = require('./routes/auth');
const { usersRouter, roomsRouter, complaintsRouter } = require('./routes/main');
const { visitorsRouter, feesRouter, announcementsRouter, attendanceRouter } = require('./routes/other');
const RoomChangeRequest = require('./models/RoomChangeRequest');
const { protect, authorize } = require('./middleware/auth');

connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'https://smarthostel-erp.netlify.app'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again in 15 minutes' }
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/auth',          authRouter);
app.use('/api/users',         usersRouter);
app.use('/api/rooms',         roomsRouter);
app.use('/api/complaints',    complaintsRouter);
app.use('/api/visitors',      visitorsRouter);
app.use('/api/fees',          feesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/attendance',    attendanceRouter);

app.get('/api/stats', protect, async (req, res) => {
  try {
    const User      = require('./models/User');
    const Room      = require('./models/Room');
    const Complaint = require('./models/Complaint');
    const { Visitor, Fee } = require('./models/Other');
    const [students, rooms, complaints, visitors, fees] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Room.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Visitor.countDocuments({ status: 'inside' }),
      Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const roomMap = rooms.reduce((a, r) => ({ ...a, [r._id]: r.count }), {});
    const compMap = complaints.reduce((a, c) => ({ ...a, [c._id]: c.count }), {});
    res.json({
      success: true,
      data: {
        students,
        occupiedRooms:    roomMap.occupied    || 0,
        availableRooms:   roomMap.available   || 0,
        maintenanceRooms: roomMap.maintenance || 0,
        complaints: {
          pending:    compMap.Pending        || 0,
          inProgress: compMap['In Progress'] || 0,
          resolved:   compMap.Resolved       || 0,
          escalated:  compMap.Escalated      || 0,
        },
        visitorsInside: visitors,
        feesCollected:  fees[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
);

app.get('/api/room-change-requests/my', protect, async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find({ student: req.user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/room-change-requests', protect, async (req, res) => {
  try {
    const user = req.user;
    const request = await RoomChangeRequest.create({
      student:        user._id,
      currentRoom:    user.room  || 'Not assigned',
      currentBlock:   user.block || '',
      preferredBlock: req.body.preferredBlock,
      reason:         req.body.reason,
      details:        req.body.details || '',
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/room-change-requests', protect, authorize('admin','warden'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await RoomChangeRequest.find(filter)
      .populate('student', 'name rollNo room block email phone')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/room-change-requests/:id', protect, authorize('admin','warden'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const request = await RoomChangeRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote: reviewNote||'', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('student', 'name rollNo room');
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api\n`);
});