const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { 
    firstName,
    lastName,
    email,
    phone,
    role,
    password,
    agreedToTOS,
    agreedToAntiCircumvention
  } = req.body;

  try {
    if (!agreedToTOS || !agreedToAntiCircumvention) {
      return res.status(400).json({ 
        error: 'You must accept Terms of Service and Anti-Circumvention Policy' 
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      role,
      password,
      agreedToTOS,
      agreedToAntiCircumvention
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        role: user.role
      }
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};