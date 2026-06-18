// This is Auth.js

const express    = require('express');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const router     = express.Router();
const User       = require('../models/User');
const { protect} = require('../middleware/auth');
const nodemailer = require('nodemailer');

// OTP temporary store
const otpStore = new Map();

// Gmail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper to send token response
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      room: user.room,
      block: user.block,
      rollNo: user.rollNo,
      branch: user.branch,
      year: user.year,
      phone: user.phone,
      feeStatus: user.feeStatus,
      attendance: user.attendance,
    },
  });
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    sendToken(user, 201, res);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success:false, message:'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success:false, message:'No account found with this email' });

    // 6 digit OTP generate karo
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 min
    otpStore.set(email, { otp, expiry });

    // Email bhejo
    await transporter.sendMail({
      from: '"SmartHostel ERP" <myhostelproject23@gmail.com>',
      to:   email,
      subject: 'Password Reset OTP – SmartHostel ERP',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0a0a1a;padding:24px;">
          <div style="max-width:480px;margin:0 auto;background:rgba(8,18,42,0.95);border:1px solid rgba(99,179,237,0.2);border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#4299e1,#7f9cf5);padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;">🏠 SmartHostel ERP</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Password Reset Request</p>
            </div>
            <div style="padding:28px;">
              <p style="color:#e2e8f0;font-size:15px;">Hello <b>${user.name}</b>,</p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
                Your OTP for password reset is:
              </p>
              <div style="background:rgba(66,153,225,0.15);border:2px dashed rgba(66,153,225,0.4);border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
                <div style="font-size:40px;font-weight:800;letter-spacing:14px;color:#63b3ed;">${otp}</div>
                <div style="font-size:12px;color:#94a3b8;margin-top:8px;">⏱ Valid for 10 minutes only</div>
              </div>
              <p style="font-size:12px;color:#94a3b8;">If you did not request this, ignore this email.</p>
            </div>
          </div>
        </div>`,
    });

    res.json({ success:true, message:'OTP sent to your email' });
  } catch(err) {
    res.status(500).json({ success:false, message: err.message || 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
    if (!stored)              return res.status(400).json({ success:false, message:'OTP expired or not found. Resend karo.' });
    if (Date.now() > stored.expiry) { otpStore.delete(email); return res.status(400).json({ success:false, message:'OTP expired. Resend karo.' }); }
    if (stored.otp !== otp)   return res.status(400).json({ success:false, message:'Invalid OTP. Dobara check karo.' });
    res.json({ success:true, message:'OTP verified' });
  } catch(err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiry)
      return res.status(400).json({ success:false, message:'Invalid or expired OTP' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success:false, message:'Password min 6 characters hona chahiye' });

    const user = await User.findOne({ email }).select('+password');
    user.password = newPassword;
    await user.save();
    otpStore.delete(email);

    res.json({ success:true, message:'Password reset successfully!' });
  } catch(err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;