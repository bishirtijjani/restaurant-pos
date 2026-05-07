// backend/controllers/uploadController.js

/**
 * @desc    Upload an image to Cloudinary and return the URL
 * @route   POST /api/upload
 * @access  Private (Requires Authentication)
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    // req.file contains the secure_url provided by multer-storage-cloudinary
    const imageUrl = req.file.path;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        url: imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload.',
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};


