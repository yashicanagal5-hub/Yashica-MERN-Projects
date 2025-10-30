const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('User model loaded');

// MongoDB schema for user documents
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    defaultChartType: {
      type: String,
      enum: ['line', 'bar', 'scatter', 'pie', 'area'],
      default: 'line'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalUploads: {
      type: Number,
      default: 0
    },
    totalAnalyses: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

console.log('User schema defined');

// TODO: Add user profile fields (bio, location, website, etc.)
// TODO: Implement user verification (email, phone)
// TODO: Add user roles and permissions system
// TODO: Implement user preferences management
// TODO: Add user activity tracking
// TODO: Implement user session management
// TODO: Add user analytics and insights
// TODO: Implement user security features
// TODO: Add user notification preferences
// TODO: Implement user social features
// TODO: Add user onboarding flow
// TODO: Implement user feedback system

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log('User: Pre-save middleware triggered for user:', this._id);
  console.log('User: Checking if password was modified:', this.isModified('password'));
  
  if (!this.isModified('password')) return next();
  
  try {
    console.log('User: Hashing password...');
    const salt = await bcrypt.genSalt(12);
    console.log('User: Generated salt with strength:', 12);
    
    this.password = await bcrypt.hash(this.password, salt);
    console.log('User: Password hashed successfully');
    
    next();
  } catch (error) {
    console.error('User: Error hashing password:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('User: Comparing password for user:', this._id);
  console.log('User: Candidate password length:', candidatePassword?.length);
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('User: Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('User: Error comparing password:', error);
    return false;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  console.log('User: Converting user to JSON, removing sensitive data');
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  console.log('User: Updating last login for user:', this._id);
  this.lastLogin = new Date();
  return this.save();
};

// Instance methods
userSchema.methods.updatePreferences = function(newPreferences) {
  console.log('User: Updating preferences for user:', this._id);
  console.log('User: Previous preferences:', this.preferences);
  console.log('User: New preferences:', newPreferences);
  
  this.preferences = { ...this.preferences, ...newPreferences };
  return this.save();
};

userSchema.methods.incrementUploadCount = function(size = 0) {
  console.log('User: Incrementing upload count for user:', this._id);
  console.log('User: File size:', size);
  
  this.stats.totalUploads += 1;
  this.stats.storageUsed += size;
  
  return this.save();
};

userSchema.methods.incrementAnalysisCount = function() {
  console.log('User: Incrementing analysis count for user:', this._id);
  this.stats.totalAnalyses += 1;
  return this.save();
};

userSchema.methods.getStorageLimit = function() {
  // In production, this would come from user plan/subscription
  const storageLimits = {
    user: 1024 * 1024 * 1024, // 1GB for regular users
    admin: 10 * 1024 * 1024 * 1024 // 10GB for admins
  };
  
  return storageLimits[this.role] || storageLimits.user;
};

userSchema.methods.getStoragePercentage = function() {
  const used = this.stats.storageUsed;
  const limit = this.getStorageLimit();
  return Math.round((used / limit) * 100);
};

userSchema.methods.canUploadFile = function(fileSize) {
  const currentUsage = this.stats.storageUsed;
  const limit = this.getStorageLimit();
  const newUsage = currentUsage + fileSize;
  
  console.log('User: Checking upload permission for user:', this._id);
  console.log('User: Current usage:', currentUsage);
  console.log('User: File size:', fileSize);
  console.log('User: New usage would be:', newUsage);
  console.log('User: Storage limit:', limit);
  
  return newUsage <= limit;
};

userSchema.methods.deactivate = function() {
  console.log('User: Deactivating user:', this._id);
  this.isActive = false;
  return this.save();
};

userSchema.methods.activate = function() {
  console.log('User: Activating user:', this._id);
  this.isActive = true;
  return this.save();
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  console.log('User: Finding user by email:', email);
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  console.log('User: Finding all active users');
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

userSchema.statics.findAdmins = function() {
  console.log('User: Finding all admin users');
  return this.find({ role: 'admin', isActive: true });
};

userSchema.statics.getUserStats = function() {
  console.log('User: Getting overall user statistics');
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        totalUploads: { $sum: '$stats.totalUploads' },
        totalAnalyses: { $sum: '$stats.totalAnalyses' },
        totalStorageUsed: { $sum: '$stats.storageUsed' },
        avgUploadsPerUser: { $avg: '$stats.totalUploads' },
        avgAnalysesPerUser: { $avg: '$stats.totalAnalyses' }
      }
    }
  ]);
};

userSchema.statics.getTopUsers = function(criteria = 'uploads', limit = 10) {
  console.log('User: Getting top users by:', criteria);
  
  const sortField = criteria === 'analyses' ? 'stats.totalAnalyses' : 'stats.totalUploads';
  
  return this.find({ isActive: true })
    .sort({ [sortField]: -1 })
    .limit(limit)
    .select('name email stats createdAt');
};

userSchema.statics.searchUsers = function(searchTerm) {
  console.log('User: Searching users with term:', searchTerm);
  
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  }).select('-password');
};

userSchema.statics.getRecentUsers = function(days = 7) {
  console.log('User: Getting users registered in last', days, 'days');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    createdAt: { $gte: cutoffDate }
  }).sort({ createdAt: -1 });
};

// Virtual fields
userSchema.virtual('formattedStorageUsed').get(function() {
  const bytes = this.stats.storageUsed;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

userSchema.virtual('formattedStorageLimit').get(function() {
  const bytes = this.getStorageLimit();
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

userSchema.virtual('daysSinceLastLogin').get(function() {
  if (!this.lastLogin) return null;
  
  const now = new Date();
  const diffTime = Math.abs(now - this.lastLogin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

userSchema.virtual('accountAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes
console.log('User: Creating database indexes...');
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
console.log('User: Indexes created successfully');

// Post-remove middleware
userSchema.post('remove', function(doc) {
  console.log('User: Post-remove middleware triggered for user:', doc._id);
  
  // Clean up related data
  // In production, you might want to:
  // - Archive user files instead of deleting
  // - Anonymize user data for analytics
  // - Send notification to user before deletion
  
  console.log('User: User removed, consider cleaning up related data');
});

// Pre-remove middleware
userSchema.pre('remove', async function(next) {
  console.log('User: Pre-remove middleware triggered for user:', this._id);
  console.log('User: Cleaning up user-related data...');
  
  try {
    // Remove user's files
    const UploadedFile = mongoose.model('UploadedFile');
    const fileCount = await UploadedFile.countDocuments({ uploadedBy: this._id });
    console.log('User: Found', fileCount, 'files to handle');
    
    // You might want to archive files instead of deleting
    // await UploadedFile.updateMany({ uploadedBy: this._id }, { $set: { isArchived: true } });
    
    // Remove user's analyses
    const Analysis = mongoose.model('Analysis');
    const analysisCount = await Analysis.countDocuments({ userId: this._id });
    console.log('User: Found', analysisCount, 'analyses to handle');
    
    // Remove user's charts
    const Chart = mongoose.model('Chart');
    const chartCount = await Chart.countDocuments({ userId: this._id });
    console.log('User: Found', chartCount, 'charts to handle');
    
    next();
  } catch (error) {
    console.error('Error in user pre-remove middleware:', error);
    next(error);
  }
});

// Notes:
// - Consider implementing user data export (GDPR compliance)
// - Add user session management
// - Implement user activity logging
// - Add user preferences synchronization
// - Consider user data anonymization options
// - Implement user feedback and rating system
// - Add user achievement/badge system
// - Consider user referral system
// - Implement user analytics and insights
// - Add user communication preferences

module.exports = mongoose.model('User', userSchema);