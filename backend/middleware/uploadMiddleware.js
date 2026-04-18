const { upload } = require('../config/cloudinary');

// Middleware for uploading a single image
const uploadSingleImage = upload.single('image');

// Wrapper to catch multer errors
const uploadMiddleware = (req, res, next) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      console.error('Multer Upload Error:', err);
      return res.status(400).json({
        success: false,
        message: 'Image upload failed. Make sure the file is an image (jpg, jpeg, png, webp).',
        error: err.message
      });
    }
    next();
  });
};

module.exports = { uploadMiddleware };
