const express = require('express');
const router = express.Router();
const { uploadDocument, getUserDocuments } = require('../controllers/documentController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

router.use(auth);
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/my-documents', getUserDocuments);

module.exports = router;