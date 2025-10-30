const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Debug logging for file upload middleware
console.log('File upload middleware loaded');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('File upload: Setting destination for file:', file.originalname);
    
    const uploadPath = path.join(__dirname, '../uploads');
    console.log('File upload: Upload path:', uploadPath);
    
    // Ensure uploads directory exists
    console.log('File upload: Checking if uploads directory exists...');
    fs.ensureDirSync(uploadPath);
    console.log('File upload: Uploads directory ready');
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log('File upload: Generating unique filename for:', file.originalname);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    
    console.log('File upload: Generated filename details:', {
      originalName: file.originalname,
      extension,
      basename,
      uniqueSuffix,
      finalName: `${basename}-${uniqueSuffix}${extension}`
    });
    
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

// File filter for Excel files only
const fileFilter = (req, file, cb) => {
  console.log('File upload: Validating file type for:', file.originalname);
  console.log('File upload: File mimetype:', file.mimetype);
  
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/octet-stream' // Sometimes Excel files come as this
  ];
  
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  console.log('File upload: File extension:', fileExtension);
  console.log('File upload: Checking against allowed types...');
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    console.log('File upload: File validation passed');
    cb(null, true);
  } else {
    console.log('File upload: File validation failed - only Excel files allowed');
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
    files: 5 // Maximum 5 files at once
  }
});

console.log('File upload: Multer configuration initialized');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.log('File upload: Handling multer error:', err);
  
  if (err instanceof multer.MulterError) {
    console.log('File upload: Multer error code:', err.code);
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        console.log('File upload: File too large error');
        return res.status(400).json({
          message: 'File too large',
          error: 'File size exceeds the maximum limit of 50MB'
        });
      case 'LIMIT_FILE_COUNT':
        console.log('File upload: Too many files error');
        return res.status(400).json({
          message: 'Too many files',
          error: 'Maximum 5 files allowed per upload'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        console.log('File upload: Unexpected file field error');
        return res.status(400).json({
          message: 'Unexpected file field',
          error: 'File field name not expected'
        });
      default:
        console.log('File upload: Generic multer error');
        return res.status(400).json({
          message: 'File upload error',
          error: err.message
        });
    }
  } else if (err) {
    console.log('File upload: Generic file upload error');
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  
  console.log('File upload: No error found, proceeding to next middleware');
  next();
};

// Clean up uploaded files on error
const cleanupFiles = (files) => {
  console.log('File upload: Cleaning up files');
  console.log('File upload: Files to cleanup:', files ? 'Files provided' : 'No files provided');
  
  if (files && Array.isArray(files)) {
    console.log('File upload: Array of files detected, cleaning up each file');
    files.forEach((file, index) => {
      console.log(`File upload: Cleaning up file ${index + 1}:`, file.path);
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('File upload: Error deleting file:', file.path, err);
        } else {
          console.log('File upload: Successfully deleted file:', file.path);
        }
      });
    });
  } else if (files && files.path) {
    console.log('File upload: Single file detected, cleaning up:', files.path);
    fs.unlink(files.path, (err) => {
      if (err) {
        console.error('File upload: Error deleting file:', files.path, err);
      } else {
        console.log('File upload: Successfully deleted file:', files.path);
      }
    });
  } else {
    console.log('File upload: No files to clean up');
  }
};

// TODO: Add antivirus scanning for uploaded files
// TODO: Implement file type validation beyond extension checking
// TODO: Add virus scanning using ClamAV or similar
// TODO: Implement file quarantine for suspicious files
// TODO: Add upload progress tracking for large files
// TODO: Implement chunked upload for very large files
// TODO: Add file deduplication logic
// TODO: Implement file encryption for sensitive uploads
// TODO: Add upload rate limiting per user
// TODO: Implement file expiration and auto-deletion
// TODO: Add support for different storage backends (S3, etc.)

// Notes:
// - Consider implementing file virus scanning in production
// - Add file compression for better storage efficiency
// - Implement proper file access controls
// - Add monitoring for file upload patterns
// - Consider file deduplication to save storage space
// - Implement proper file backup strategy
// - Add file versioning for uploaded files
// - Consider implementing file preview thumbnails

module.exports = {
  upload,
  handleMulterError,
  cleanupFiles
};