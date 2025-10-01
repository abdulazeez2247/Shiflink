const User = require('../models/User');
const { generateJWT } = require('../utils/generateToken');
const createError = require('http-errors');
const crypto = require("crypto");
const AuditLog = require('../models/AuditLog');
const { sendEmail } = require("../utils/emailService");

const register = async (req, res, next) => {
  try {
    console.log('📨 Registration request body:', req.body);
    
    const { 
      password, 
      confirmPassword, 
      firstName, 
      lastName, 
      email, 
      role, 
      phone,
      agreedToTOS,
      agreedToAntiCircumvention 
    } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if required boolean fields are true
    if (agreedToTOS !== true) {
      return res.status(400).json({ message: "You must agree to Terms of Service" });
    }

    if (agreedToAntiCircumvention !== true) {
      return res.status(400).json({ message: "You must agree to Anti-Circumvention policy" });
    }

    // Create user with properly mapped fields
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password,
      role: role.toLowerCase(),
      phone,
      agreedToTOS,
      agreedToAntiCircumvention
    });
    
    const token = generateJWT({ userId: user._id, role: user.role }, process.env.JWT_SECRET, '7d');
    
    await AuditLog.create({
      user: user._id,
      role: user.role,
      action: 'user_registered',
      targetModel: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role }
    });

    console.log('✅ User registered successfully:', user.email);

    // Return user data without password
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        agreedToTOS: user.agreedToTOS,
        agreedToAntiCircumvention: user.agreedToAntiCircumvention,
        complianceStatus: user.complianceStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }, 
      token 
    });
  } catch (err) {
    console.error('🔥 Registration error:', err.message);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle other errors
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateJWT({ userId: user._id, role: user.role }, process.env.JWT_SECRET, '7d');
    
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,  
        phone: user.phone,
        complianceStatus: user.complianceStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (err) {
    console.error('🔥 Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      process.env.SENDGRID_RESET_TEMPLATE_ID,
      { reset_url: resetUrl, name: `${user.first_name} ${user.last_name}` }
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error('🔥 Forgot password error:', err.message);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

module.exports = { register, login, forgotPassword };