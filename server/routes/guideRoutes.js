const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const guideController = require('../controllers/guideController');
// flow => request came -> mutler middleware extracted the video file -> controller ran to handle the request
router.post('/upload',upload.single('video'), guideController.uploadGuide);
module.exports = router;