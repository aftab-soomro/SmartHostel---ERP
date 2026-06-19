// This is Auth.js

// ====== CRITICAL: DNS & Nodemailer IPv4-Only Configuration ======
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const { protect} = require('../middleware/auth');
const nodemailer = require('nodemailer');

const otpStore = new Map();

// ====== ENVIRONMENT VARIABLE VALIDATION ======
// Fail fast if email credentials are not configured
if (!process.env.BREVO_SMTP_KEY) {
  console.error('❌ CRITICAL: BREVO_SMTP_KEY environment variable is not set!');
  console.error('   Forgot-password endpoint will fail. Please set this in your Render environment.');
  console.error('   Get free SMTP key from: https://app.brevo.com/settings/keys/smtp');
}

// ====== BREVO NODEMAILER TRANSPORTER (Most Reliable for Render) ======
// Brevo is specifically designed for reliable email delivery on cloud platforms like Render.
// Free tier: 300 emails/day, no credit card required
// Why Brevo instead of Gmail: 
//   - Gmail SMTP on Render free tier has connectivity issues
//   - Brevo has dedicated SMTP infrastructure for cloud deployments
//   - No IPv6/DNS resolution issues
const transporter = nodemailer.createTransport({
  // Brevo SMTP endpoints (both work, but smtp-relay.brevo.com is faster)
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    // Brevo uses API key (not email + password)
    // You can use the API key as both user and pass
    user: 'apikey',
    pass: process.env.BREVO_SMTP_KEY,
  },
  // Connection settings
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// ====== VERIFY TRANSPORTER ON STARTUP ======
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer SMTP Connection Failed:', error.message);
    console.error('   Host: smtp-relay.brevo.com, Port: 587');
    console.error('   Check BREVO_SMTP_KEY at: https://app.brevo.com/settings/keys/smtp');
  } else {
    console.log('✅ Nodemailer SMTP Connection Verified - Ready to send emails via Brevo');
  }
});

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

router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // ====== INPUT VALIDATION ======
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    // ====== ENVIRONMENT VARIABLE CHECK ======
    if (!process.env.BREVO_SMTP_KEY) {
      console.error('❌ [forgot-password] BREVO_SMTP_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Contact administrator.',
      });
    }

    // ====== USER LOOKUP ======
    console.log(`[forgot-password] Looking up user with email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[forgot-password] No account found for email: ${email}`);
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    console.log(`[forgot-password] User found: ${user.name} (${user._id})`);

    // ====== OTP GENERATION ======
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiry });
    console.log(`[forgot-password] OTP generated for ${email}: ${otp} (expires in 10 min)`);

    // ====== EMAIL SENDING WITH DETAILED ERROR LOGGING ======
    console.log(`[forgot-password] Starting email send to: ${email}`);
    console.log(`[forgot-password] SMTP Host: smtp-relay.brevo.com:587 (Reliable, Render-optimized)`);

    try {
      const mailOptions = {
        from: `"SmartHostel ERP" <noreply@smarthostel.com>`,
        to: email,
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
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;">Your OTP for password reset is:</p>
                <div style="background:rgba(66,153,225,0.15);border:2px dashed rgba(66,153,225,0.4);border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
                  <div style="font-size:40px;font-weight:800;letter-spacing:14px;color:#63b3ed;">${otp}</div>
                  <div style="font-size:12px;color:#94a3b8;margin-top:8px;">⏱ Valid for 10 minutes only</div>
                </div>
                <p style="font-size:12px;color:#94a3b8;">If you did not request this, ignore this email.</p>
              </div>
            </div>
          </div>`,
      };

      // Attempt to send the email with timeout handling
      const sendMailPromise = transporter.sendMail(mailOptions);
      
      // Add a timeout wrapper to catch hanging connections
      // (Render free tier can hang indefinitely without this)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout after 15 seconds')), 15000)
      );

      const result = await Promise.race([sendMailPromise, timeoutPromise]);

      console.log(`✅ [forgot-password] Email sent successfully to: ${email}`);
      console.log(`   Response: ${result.response}`);

      res.json({ success: true, message: 'OTP sent to your email' });

    } catch (emailError) {
      // ====== DETAILED EMAIL ERROR LOGGING ======
      console.error(`❌ [forgot-password] Email sending failed for: ${email}`);
      console.error(`   Error Type: ${emailError.code || emailError.name || 'Unknown'}`);
      console.error(`   Error Message: ${emailError.message}`);
      console.error(`   Full Error:`, emailError);

      // Log specific error codes that help diagnose the issue
      if (emailError.code === 'ECONNREFUSED') {
        console.error('   ↳ Connection Refused: SMTP server rejected the connection');
        console.error('   ↳ Check BREVO_SMTP_KEY at https://app.brevo.com/settings/keys/smtp');
      } else if (emailError.code === 'ENOTFOUND') {
        console.error('   ↳ DNS Resolution Failed: Cannot resolve smtp-relay.brevo.com');
        console.error('   ↳ Check internet connectivity on Render');
      } else if (emailError.code === 'ESOCKET') {
        console.error('   ↳ Socket Error: Connection lost or hung up');
      } else if (emailError.message.includes('timeout') || emailError.code === 'ETIMEDOUT') {
        console.error('   ↳ Connection Timeout: Email send took too long');
        console.error('   ↳ Brevo server may be slow or Render is rate-limiting');
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again in a few moments.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
      });
    }

  } catch (err) {
    // ====== GENERAL ERROR HANDLING ======
    console.error('❌ [forgot-password] Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to process forgot-password request',
    });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ success:false, message:'OTP expired or not found. Resend karo.' });
    if (Date.now() > stored.expiry) { otpStore.delete(email); return res.status(400).json({ success:false, message:'OTP expired. Resend karo.' }); }
    if (stored.otp !== otp) return res.status(400).json({ success:false, message:'Invalid OTP. Dobara check karo.' });
    res.json({ success:true, message:'OTP verified' });
  } catch(err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

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