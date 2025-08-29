const express = require('express');
const router = express.Router();
const { uploadCredential, getUserCredentials } = require('../controllers/complianceController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

router.use(auth);
router.post('/upload-credential', upload.single('document'), uploadCredential);
router.get('/credentials', getUserCredentials);

module.exports = router;