// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

// Endpoint: POST /api/upload
// Uses uploadMiddleware to process the file, then uploadController to return the URL
router.post('/', uploadMiddleware, uploadImage);

module.exports = router;
