const cloudinary = require('cloudinary').v2;
const createError = require('http-errors');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


const uploadToCloudinary = async (filePath, folder = '') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: false
    });
    return result;
  } catch (err) {
    throw createError(500, 'Cloudinary upload failed', { originalError: err });
  }
};

module.exports = { cloudinary, uploadToCloudinary };