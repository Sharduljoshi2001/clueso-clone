const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const guideController = require('../controllers/guideController');
//routes
// flow => request came -> mutler middleware extracted the video file -> controller ran to handle the request
router.post('/upload',upload.single('video'), guideController.uploadGuide);
//get all guides
router.get('/', guideController.getAllGuides);
//get single guide by id
router.get('/:id', guideController.getGuideById);
//route for ai generated video
router.post('/:id/analyze', guideController.generateAI);
module.exports = router;