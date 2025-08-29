const Document = require('../models/Document');
const { uploadToCloudinary } = require('../config/cloudinary');
const createError = require('http-errors');

const uploadDocument = async (req, res, next) => {
  try {
    const result = await uploadToCloudinary(req.file.path, 'documents');
    const document = await Document.create({
      ...req.body,
      owner: req.user._id,
      ownerModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      fileUrl: result.secure_url
    });

    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

const getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ owner: req.user._id });
    res.json(documents);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getUserDocuments };