const express = require('express');
const { Visitor, Fee, Announcement, Attendance } = require('../models/Other');
const { protect, authorize } = require('../middleware/auth');

// ── VISITORS ─────────────────────────────────────────────
const visitorsRouter = express.Router();
visitorsRouter.use(protect);

visitorsRouter.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const visitors = await Visitor.find(filter)
      .populate('student', 'name room block')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: visitors.length, data: visitors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

visitorsRouter.post('/', async (req, res) => {
  try {
    const visitor = await Visitor.create({ ...req.body, student: req.body.student || req.user._id });
    res.status(201).json({ success: true, data: visitor });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

visitorsRouter.put('/:id', authorize('admin', 'warden'), async (req, res) => {
  try {
    const update = req.body;
    if (update.status === 'inside') update.entryTime = new Date();
    if (update.status === 'completed') update.exitTime = new Date();
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: visitor });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── FEES ──────────────────────────────────────────────────
const feesRouter = express.Router();
feesRouter.use(protect);

feesRouter.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const fees = await Fee.find(filter).populate('student', 'name rollNo room').sort({ createdAt: -1 });
    res.json({ success: true, count: fees.length, data: fees });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

feesRouter.post('/', authorize('admin', 'warden'), async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({ success: true, data: fee });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

feesRouter.put('/:id/pay', async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id,
      { status: 'paid', paidAt: new Date(), transactionId: req.body.transactionId },
      { new: true });
    res.json({ success: true, data: fee });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Analytics
feesRouter.get('/analytics/monthly', authorize('admin', 'warden'), async (req, res) => {
  try {
    const data = await Fee.aggregate([
      { $group: { _id: { month: '$month', year: '$year', status: '$status' },
          total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────
const announcementsRouter = express.Router();
announcementsRouter.use(protect);

announcementsRouter.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'name role')
      .sort({ pinned: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

announcementsRouter.post('/', authorize('admin', 'warden'), async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, data: ann });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

announcementsRouter.put('/:id', authorize('admin', 'warden'), async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: ann });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

announcementsRouter.delete('/:id', authorize('admin', 'warden'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ATTENDANCE ─────────────────────────────────────────────
const attendanceRouter = express.Router();
attendanceRouter.use(protect);

attendanceRouter.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.query.date) filter.date = req.query.date;
    const records = await Attendance.find(filter).populate('student', 'name rollNo room');
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

attendanceRouter.post('/bulk', authorize('admin', 'warden'), async (req, res) => {
  try {
    // records = [{ student, date, status }]
    const { records } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter: { student: r.student, date: r.date },
        update: { $set: { ...r, markedBy: req.user._id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: `${records.length} records saved` });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = { visitorsRouter, feesRouter, announcementsRouter, attendanceRouter };
