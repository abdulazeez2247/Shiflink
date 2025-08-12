const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Special admin invitation (manual creation only)
exports.createAdmin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const admin = await Admin.create({ email, password });
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Shorter expiry for admin tokens
    );
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin login (separate from user login)
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error('Admin not found');
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};