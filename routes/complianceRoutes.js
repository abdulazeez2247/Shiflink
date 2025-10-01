const express = require('express');
const router = express.Router();
const { 
  uploadCredential, 
  getUserCredentials, 
  getComplianceStatus,
  getRequiredDocuments
} = require('../controllers/complianceController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

router.use(auth);
router.post('/upload-credential', upload.single('document'), uploadCredential);
router.get('/credentials', getUserCredentials);
router.get('/status', getComplianceStatus);
router.get('/required-documents', getRequiredDocuments);

// Make sure this is the last line
module.exports = router; // ✅ Correct export