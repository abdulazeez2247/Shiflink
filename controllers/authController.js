const User = require('../models/User');
const { generateJWT } = require('../utils/generateToken');
const createError = require('http-errors');
const crypto = require("crypto");
const AuditLog = require('../models/AuditLog');
const { sendEmail } = require("../utils/emailService");
const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = generateJWT({ userId: user._id, role: user.role }, process.env.JWT_SECRET, '7d');
    
    await AuditLog.create({
      user: user._id,
      role: user.role,
      action: 'user_registered',
      targetModel: 'User',
      targetId: user._id
    });

    res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    next(createError(400, err.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, 'Invalid credentials');
    }

    const token = generateJWT({ userId: user._id, role: user.role }, process.env.JWT_SECRET, '7d');
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    next(err);
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      process.env.SENDGRID_RESET_TEMPLATE_ID, // dynamic template from SendGrid
      { reset_url: resetUrl, name: user.name }
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};


module.exports = { register, login, forgotPassword };