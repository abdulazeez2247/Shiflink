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

// Add compliance status function to existing controller
const getComplianceStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Define required compliance items for DSPs
    const requiredItems = [
      { id: 'background_check', name: 'Background Check' },
      { id: 'insurance_document', name: 'Insurance Documentation' },
      { id: 'training_certificate', name: 'Training Certificate' },
      { id: 'license_verification', name: 'Professional License' }
    ];
    
    // Get user's current credentials
    const userCredentials = await Credential.find({ 
      owner: userId, 
      isDeleted: false,
      status: 'approved'
    });
    
    // Check which items are completed
    const completedItems = [];
    const missingItems = [];
    
    for (const item of requiredItems) {
      const hasValidCredential = userCredentials.some(cred => {
        const isTypeMatch = cred.type === item.id;
        const isNotExpired = !cred.expiryDate || cred.expiryDate > new Date();
        return isTypeMatch && isNotExpired;
      });
      
      if (hasValidCredential) {
        completedItems.push(item.id);
      } else {
        missingItems.push(item.id);
      }
    }
    
    const isComplete = missingItems.length === 0;
    
    res.json({
      isComplete,
      completedItems,
      missingItems,
      progress: {
        completed: completedItems.length,
        total: requiredItems.length,
        percentage: Math.round((completedItems.length / requiredItems.length) * 100)
      },
      requiredItems: requiredItems.map(item => ({
        ...item,
        isCompleted: completedItems.includes(item.id),
        credential: userCredentials.find(cred => cred.type === item.id)
      }))
    });
    
  } catch (err) {
    next(err);
  }
};

// Add required documents function
const getRequiredDocuments = async (req, res, next) => {
  try {
    // Return list of required documents for DSPs
    const requiredDocs = [
      {
        id: 'background_check',
        name: 'Background Check',
        description: 'Recent criminal background check certificate',
        acceptedFormats: ['pdf', 'jpg', 'png', 'jpeg'],
        maxSize: '5MB'
      },
      {
        id: 'insurance_document',
        name: 'Insurance Documentation',
        description: 'Proof of professional liability insurance',
        acceptedFormats: ['pdf', 'jpg', 'png', 'jpeg'],
        maxSize: '5MB'
      },
      {
        id: 'training_certificate',
        name: 'Training Certificate',
        description: 'Completed training program certificate',
        acceptedFormats: ['pdf', 'jpg', 'png', 'jpeg'],
        maxSize: '5MB'
      },
      {
        id: 'license_verification',
        name: 'Professional License',
        description: 'Current professional license verification',
        acceptedFormats: ['pdf', 'jpg', 'png', 'jpeg'],
        maxSize: '5MB'
      }
    ];
    
    res.json(requiredDocs);
  } catch (err) {
    next(err);
  }
};

// Export all functions including the new ones
module.exports = { 
  uploadCredential, 
  getUserCredentials, 
  getComplianceStatus,  // Add this
  getRequiredDocuments  // Add this
};