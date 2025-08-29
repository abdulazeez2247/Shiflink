const Credential = require('../models/Credential');
const ComplianceLog = require('../models/ComplianceLog');
const createError = require('http-errors');

const uploadCredential = async (req, res, next) => {
  try {
    const credential = await Credential.create({ 
      ...req.body, 
      owner: req.user._id,
      documentUrl: req.file.path 
    });

    await ComplianceLog.create({
      user: req.user._id,
      action: 'credential_uploaded',
      targetModel: 'Credential',
      targetId: credential._id,
      details: `Uploaded ${credential.type} credential`
    });

    res.status(201).json(credential);
  } catch (err) {
    next(err);
  }
};

const getUserCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find({ owner: req.user._id, isDeleted: false });
    res.json(credentials);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadCredential, getUserCredentials };