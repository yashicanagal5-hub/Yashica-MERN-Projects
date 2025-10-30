const mongoose = require('mongoose');

console.log('UploadedFile model loaded');

// MongoDB schema for file documents
const uploadedFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    sheets: {
      type: Array,
      default: []
    },
    totalRows: {
      type: Number,
      default: 0
    },
    totalColumns: {
      type: Number,
      default: 0
    },
    columnHeaders: {
      type: Array,
      default: []
    },
    dataTypes: {
      type: Object,
      default: {}
    },
    hasHeaders: {
      type: Boolean,
      default: true
    }
  },
  processed: {
    type: Boolean,
    default: false
  },
  processingError: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'error'],
    default: 'uploading'
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  analyses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis'
  }]
}, {
  timestamps: true
});

console.log('UploadedFile schema defined');

// Index for efficient queries
console.log('UploadedFile: Creating database indexes...');
uploadedFileSchema.index({ uploadedBy: 1, createdAt: -1 });
uploadedFileSchema.index({ status: 1 });
uploadedFileSchema.index({ tags: 1 });
uploadedFileSchema.index({ isPublic: 1 });
console.log('UploadedFile: Indexes created successfully');

// Virtual for file URL
uploadedFileSchema.virtual('fileUrl').get(function() {
  return `/uploads/${this.filename}`;
});

console.log('UploadedFile: Virtual fileUrl property defined');

// TODO: Add file versioning support
// TODO: Implement file deduplication
// TODO: Add file preview thumbnails
// TODO: Implement file compression
// TODO: Add file virus scanning
// TODO: Implement file access logging
// TODO: Add file sharing and permissions
// TODO: Implement file backup strategy
// TODO: Add file audit trail
// TODO: Implement file expiration
// TODO: Add file metadata extraction
// TODO: Implement file validation rules

// Update user stats when file is saved
uploadedFileSchema.post('save', async function() {
  console.log('UploadedFile: Post-save hook triggered for file:', this._id);
  console.log('UploadedFile: File status:', this.status);
  console.log('UploadedFile: File size:', this.size);
  
  try {
    const User = mongoose.model('User');
    console.log('UploadedFile: Updating user stats for userId:', this.uploadedBy);
    
    await User.findByIdAndUpdate(this.uploadedBy, {
      $inc: { 
        'stats.totalUploads': 1,
        'stats.storageUsed': this.size
      }
    });
    
    console.log('UploadedFile: User stats updated successfully');
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
});

// Instance methods
uploadedFileSchema.methods.markAsProcessing = function() {
  console.log('UploadedFile: Marking file as processing:', this._id);
  this.status = 'processing';
  this.processingError = null;
  return this.save();
};

uploadedFileSchema.methods.markAsCompleted = function(metadata) {
  console.log('UploadedFile: Marking file as completed:', this._id);
  this.status = 'completed';
  this.processed = true;
  this.processingError = null;
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

uploadedFileSchema.methods.markAsError = function(errorMessage) {
  console.log('UploadedFile: Marking file as error:', this._id);
  console.log('UploadedFile: Error message:', errorMessage);
  this.status = 'error';
  this.processingError = errorMessage;
  return this.save();
};

uploadedFileSchema.methods.addAnalysis = function(analysisId) {
  console.log('UploadedFile: Adding analysis reference for file:', this._id);
  console.log('UploadedFile: Analysis ID:', analysisId);
  
  if (!this.analyses.includes(analysisId)) {
    this.analyses.push(analysisId);
    return this.save();
  }
  
  console.log('UploadedFile: Analysis already associated with file');
  return Promise.resolve(this);
};

uploadedFileSchema.methods.removeAnalysis = function(analysisId) {
  console.log('UploadedFile: Removing analysis reference for file:', this._id);
  console.log('UploadedFile: Analysis ID:', analysisId);
  
  this.analyses = this.analyses.filter(id => !id.equals(analysisId));
  return this.save();
};

uploadedFileSchema.methods.incrementDownloadCount = function() {
  console.log('UploadedFile: Incrementing download count for file:', this._id);
  this.downloadCount += 1;
  return this.save();
};

uploadedFileSchema.methods.updateMetadata = function(newMetadata) {
  console.log('UploadedFile: Updating metadata for file:', this._id);
  console.log('UploadedFile: Previous metadata:', this.metadata);
  
  this.metadata = { ...this.metadata, ...newMetadata };
  console.log('UploadedFile: New metadata:', this.metadata);
  
  return this.save();
};

// Static methods
uploadedFileSchema.statics.findByUser = function(userId, options = {}) {
  console.log('UploadedFile: Finding files by user:', userId);
  const query = { uploadedBy: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  if (options.search) {
    query.$or = [
      { originalName: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  return this.find(query)
    .populate('analyses', 'title status')
    .sort({ createdAt: -1 });
};

uploadedFileSchema.statics.findPublicFiles = function(options = {}) {
  console.log('UploadedFile: Finding public files');
  const query = { isPublic: true };
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  return this.find(query)
    .populate('uploadedBy', 'name')
    .populate('analyses', 'title status')
    .sort({ createdAt: -1 });
};

uploadedFileSchema.statics.findUnprocessed = function() {
  console.log('UploadedFile: Finding unprocessed files');
  return this.find({
    status: { $in: ['uploading', 'processing'] }
  })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: 1 });
};

uploadedFileSchema.statics.getStorageStats = function(userId) {
  console.log('UploadedFile: Getting storage stats for user:', userId);
  return this.aggregate([
    { $match: { uploadedBy: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgFileSize: { $avg: '$size' },
        processedFiles: { $sum: { $cond: [{ $eq: ['$processed', true] }, 1, 0] } },
        publicFiles: { $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] } }
      }
    }
  ]);
};

uploadedFileSchema.statics.searchFiles = function(searchTerm, userId = null) {
  console.log('UploadedFile: Searching files with term:', searchTerm);
  
  const query = {
    $or: [
      { originalName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (userId) {
    query.uploadedBy = userId;
  }
  
  return this.find(query)
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
};

// Virtual methods
uploadedFileSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

uploadedFileSchema.virtual('hasAnalyses').get(function() {
  return this.analyses && this.analyses.length > 0;
});

uploadedFileSchema.virtual('isProcessable').get(function() {
  return this.mimetype.includes('spreadsheet') || 
         this.mimetype.includes('excel') || 
         this.originalName.endsWith('.xlsx') || 
         this.originalName.endsWith('.xls');
});

// Pre-save middleware
uploadedFileSchema.pre('save', function(next) {
  console.log('UploadedFile: Pre-save middleware triggered for file:', this._id);
  
  // Validate file size
  if (this.size > 50 * 1024 * 1024) { // 50MB limit
    console.log('UploadedFile: File size exceeds limit');
    return next(new Error('File size exceeds 50MB limit'));
  }
  
  // Validate file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream'
  ];
  
  if (!allowedTypes.includes(this.mimetype) && 
      !this.originalName.endsWith('.xlsx') && 
      !this.originalName.endsWith('.xls')) {
    console.log('UploadedFile: File type not allowed');
    return next(new Error('Only Excel files are allowed'));
  }
  
  next();
});

// Post-save middleware
uploadedFileSchema.post('save', function(doc) {
  console.log('UploadedFile: Post-save middleware triggered for file:', doc._id);
  console.log('UploadedFile: File saved with status:', doc.status);
  console.log('UploadedFile: File processed:', doc.processed);
  console.log('UploadedFile: File size:', doc.formattedSize);
});

// Pre-remove middleware
uploadedFileSchema.pre('remove', async function(next) {
  console.log('UploadedFile: Pre-remove middleware triggered for file:', this._id);
  console.log('UploadedFile: Cleaning up associated analyses...');
  
  try {
    // Remove file path
    const fs = require('fs-extra');
    if (await fs.pathExists(this.path)) {
      await fs.remove(this.path);
      console.log('UploadedFile: File removed from filesystem');
    }
    
    // Optionally remove associated analyses
    if (this.analyses && this.analyses.length > 0) {
      console.log('UploadedFile: Found analyses to clean up:', this.analyses.length);
      // You might want to delete or archive associated analyses here
      // await mongoose.model('Analysis').deleteMany({ fileId: this._id });
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-remove middleware:', error);
    next(error);
  }
});

// Notes:
// - Consider implementing file encryption for sensitive data
// - Add file virus scanning integration
// - Implement file deduplication logic
// - Add file versioning system
// - Implement file backup and recovery
// - Add file access logging and audit trail
// - Consider implementing file sharing with expiration
// - Add file metadata enrichment
// - Implement file performance optimization
// - Consider file lifecycle management

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);