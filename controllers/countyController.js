const User = require('../models/User');
const createError = require('http-errors');

const getCountyDSPs = async (req, res, next) => {
  try {
    const dsps = await User.find({ role: 'dsp', county: req.user.county })
      .select('-password')
      .populate('credentials');

    res.json(dsps);
  } catch (err) {
    next(err);
  }
};

const verifyDSPCompliance = async (req, res, next) => {
  try {
    const dsp = await User.findById(req.params.id);
    if (!dsp || dsp.role !== 'dsp') throw createError(404, 'DSP not found');

    const validCredentials = await Credential.find({
      owner: dsp._id,
      verificationStatus: 'verified',
      expiryDate: { $gt: new Date() }
    });

    const isCompliant = validCredentials.length >= 2;
    await User.findByIdAndUpdate(dsp._id, { 'complianceStatus.isComplete': isCompliant });

    res.json({ isCompliant, validCredentials: validCredentials.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCountyDSPs, verifyDSPCompliance };