const User = require('../models/User');
const UploadedFile = require('../models/UploadedFile');
const Analysis = require('../models/Analysis');
const Chart = require('../models/Chart');
const mongoose = require('mongoose');

console.log('👑 adminController: Loading admin management controllers');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  console.log('📊 adminController: getDashboardStats - Admin:', req.user._id);
  
  try {
    // Get basic counts
    console.log('📈 adminController: Fetching basic counts...');
    const [userCount, fileCount, analysisCount, chartCount] = await Promise.all([
      User.countDocuments(),
      UploadedFile.countDocuments(),
      Analysis.countDocuments(),
      Chart.countDocuments()
    ]);
    
    console.log(`📊 adminController: Basic stats - Users: ${userCount}, Files: ${fileCount}, Analyses: ${analysisCount}, Charts: ${chartCount}`);
    
    // Get user registrations over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    console.log('📈 adminController: Fetching user registration trends...');
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get file uploads over time (last 30 days)
    console.log('📁 adminController: Fetching file upload trends...');
    const fileUploads = await UploadedFile.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 },
          totalSize: { $sum: "$size" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get storage usage
    console.log('💾 adminController: Calculating storage statistics...');
    const storageStats = await UploadedFile.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
          avgSize: { $avg: "$size" },
          maxSize: { $max: "$size" }
        }
      }
    ]);
    
    // Get top users by activity
    console.log('🏆 adminController: Finding top active users...');
    const topUsers = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          totalActivity: {
            $add: ["$stats.totalUploads", "$stats.totalAnalyses"]
          },
          storageUsed: "$stats.storageUsed",
          lastLogin: 1
        }
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 }
    ]);
    
    // Get analysis status distribution
    console.log('📊 adminController: Analyzing status distribution...');
    const analysisStats = await Analysis.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get chart type distribution
    console.log('📈 adminController: Analyzing chart type distribution...');
    const chartTypeStats = await Analysis.aggregate([
      {
        $group: {
          _id: "$configuration.chartType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ adminController: Dashboard statistics compiled successfully');
    
    res.json({
      overview: {
        totalUsers: userCount,
        totalFiles: fileCount,
        totalAnalyses: analysisCount,
        totalCharts: chartCount,
        totalStorage: storageStats[0]?.totalSize || 0,
        avgFileSize: storageStats[0]?.avgSize || 0
      },
      trends: {
        userRegistrations,
        fileUploads
      },
      topUsers,
      analysisStats: analysisStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      chartTypeStats
    });
  } catch (error) {
    console.error('❌ adminController: Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics', 
      error: error.message 
    });
  }
};

// Get all users with pagination and filters
const getUsers = async (req, res) => {
  console.log('👥 adminController: getUsers - Admin:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      isActive,
      search
    } = req.query;
    
    const query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
      console.log('🔍 adminController: Filtering by role:', role);
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
      console.log('🔍 adminController: Filtering by active status:', query.isActive);
    }
    
    // Search in name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 adminController: Searching users with term:', search);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('👥 adminController: Fetching users - Page:', page, 'Limit:', limit);
    
    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');
    
    const total = await User.countDocuments(query);
    
    console.log(`✅ adminController: Found ${users.length} users out of ${total} total`);
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ adminController: Get users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// Get specific user details
const getUserDetails = async (req, res) => {
  console.log('👤 adminController: getUserDetails - User:', req.params.userId, 'Admin:', req.user._id);
  
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('❌ adminController: User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's files and analyses
    console.log('📁 adminController: Fetching user files...');
    const [files, analyses] = await Promise.all([
      UploadedFile.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('originalName size status createdAt'),
      Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title status createdAt configuration.chartType')
    ]);
    
    // Get user activity stats
    console.log('📊 adminController: Calculating user activity stats...');
    const activityStats = await UploadedFile.aggregate([
      { $match: { uploadedBy: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          fileCount: { $sum: 1 },
          totalSize: { $sum: "$size" }
        }
      },
      { $sort: { _id: -1 } },
      { limit: 30 }
    ]);
    
    console.log('✅ adminController: User details retrieved successfully');
    
    res.json({
      user,
      recentFiles: files,
      recentAnalyses: analyses,
      activityStats
    });
  } catch (error) {
    console.error('❌ adminController: Get user details error:', error);
    res.status(500).json({ 
      message: 'Error fetching user details', 
      error: error.message 
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  console.log('✏️ adminController: updateUser - User:', req.params.userId, 'Admin:', req.user._id);
  
  try {
    const { userId } = req.params;
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ adminController: User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && isActive === false) {
      console.log('⚠️ adminController: Admin attempting to deactivate own account');
      return res.status(400).json({ 
        message: 'You cannot deactivate your own account' 
      });
    }
    
    // Prevent changing email to one that already exists
    if (email && email !== user.email) {
      console.log('🔍 adminController: Checking if email already exists...');
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        console.log('⚠️ adminController: Email already exists:', email);
        return res.status(400).json({ 
          message: 'Email already exists' 
        });
      }
    }
    
    const updates = {};
    if (name) {
      updates.name = name;
      console.log('📝 adminController: Updating user name to:', name);
    }
    if (email) {
      updates.email = email;
      console.log('📧 adminController: Updating user email to:', email);
    }
    if (role) {
      updates.role = role;
      console.log('👤 adminController: Updating user role to:', role);
    }
    if (isActive !== undefined) {
      updates.isActive = isActive;
      console.log('🔄 adminController: Updating user active status to:', isActive);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('✅ adminController: User updated successfully');
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ adminController: Update user error:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  console.log('🗑️ adminController: deleteUser - User:', req.params.userId, 'Admin:', req.user._id);
  
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      console.log('⚠️ adminController: Admin attempting to delete own account');
      return res.status(400).json({ 
        message: 'You cannot delete your own account' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ adminController: User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('🗑️ adminController: Deleting user data and associated files...');
    
    // Delete user's files, analyses, and charts
    const files = await UploadedFile.find({ uploadedBy: userId });
    
    // Delete physical files
    const fs = require('fs-extra');
    for (const file of files) {
      try {
        await fs.unlink(file.path);
        console.log('🗑️ adminController: Deleted physical file:', file.originalName);
      } catch (error) {
        console.warn('⚠️ adminController: Could not delete physical file:', error.message);
      }
    }
    
    // Delete database records
    console.log('🗑️ adminController: Deleting database records...');
    await Promise.all([
      UploadedFile.deleteMany({ uploadedBy: userId }),
      Analysis.deleteMany({ userId }),
      Chart.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);
    
    console.log('✅ adminController: User and all associated data deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ adminController: Delete user error:', error);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

// Get all files with admin view
const getAllFiles = async (req, res) => {
  console.log('📁 adminController: getAllFiles - Admin:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
      console.log('🔍 adminController: Filtering files by status:', status);
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 adminController: Searching files with term:', search);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('📁 adminController: Fetching all files - Page:', page, 'Limit:', limit);
    
    const files = await UploadedFile.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'name email')
      .select('-path');
    
    const total = await UploadedFile.countDocuments(query);
    
    console.log(`✅ adminController: Found ${files.length} files out of ${total} total`);
    
    res.json({
      files,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ adminController: Get all files error:', error);
    res.status(500).json({ 
      message: 'Error fetching files', 
      error: error.message 
    });
  }
};

// Get all analyses with admin view
const getAllAnalyses = async (req, res) => {
  console.log('📈 adminController: getAllAnalyses - Admin:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      chartType,
      search
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
      console.log('🔍 adminController: Filtering analyses by status:', status);
    }
    
    if (chartType) {
      query['configuration.chartType'] = chartType;
      console.log('🔍 adminController: Filtering analyses by chart type:', chartType);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 adminController: Searching analyses with term:', search);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('📈 adminController: Fetching all analyses - Page:', page, 'Limit:', limit);
    
    const analyses = await Analysis.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .populate('fileId', 'originalName size')
      .select('-results.processedData');
    
    const total = await Analysis.countDocuments(query);
    
    console.log(`✅ adminController: Found ${analyses.length} analyses out of ${total} total`);
    
    res.json({
      analyses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ adminController: Get all analyses error:', error);
    res.status(500).json({ 
      message: 'Error fetching analyses', 
      error: error.message 
    });
  }
};

// Delete file (admin)
const deleteFile = async (req, res) => {
  console.log('🗑️ adminController: deleteFile - File:', req.params.fileId, 'Admin:', req.user._id);
  
  try {
    const { fileId } = req.params;
    
    const file = await UploadedFile.findById(fileId);
    if (!file) {
      console.log('❌ adminController: File not found:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('🗑️ adminController: Deleting file and associated data...');
    
    // Delete associated analyses and charts
    await Promise.all([
      Analysis.deleteMany({ fileId }),
      Chart.deleteMany({ analysisId: { $in: await Analysis.find({ fileId }).distinct('_id') } })
    ]);
    
    // Delete physical file
    const fs = require('fs-extra');
    try {
      await fs.unlink(file.path);
      console.log('✅ adminController: Physical file deleted successfully');
    } catch (error) {
      console.warn('⚠️ adminController: Could not delete physical file:', error.message);
    }
    
    // Delete database record
    await UploadedFile.findByIdAndDelete(fileId);
    
    // Update user stats
    console.log('📊 adminController: Updating user statistics...');
    await User.findByIdAndUpdate(file.uploadedBy, {
      $inc: { 
        'stats.totalUploads': -1,
        'stats.storageUsed': -file.size
      }
    });
    
    console.log('✅ adminController: File deleted successfully');
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('❌ adminController: Admin delete file error:', error);
    res.status(500).json({ 
      message: 'Error deleting file', 
      error: error.message 
    });
  }
};

// Delete analysis (admin)
const deleteAnalysis = async (req, res) => {
  console.log('🗑️ adminController: deleteAnalysis - Analysis:', req.params.analysisId, 'Admin:', req.user._id);
  
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      console.log('❌ adminController: Analysis not found:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    // Delete associated charts
    console.log('🗑️ adminController: Deleting associated charts...');
    await Chart.deleteMany({ analysisId });
    
    // Delete analysis
    console.log('🗑️ adminController: Deleting analysis record...');
    await Analysis.findByIdAndDelete(analysisId);
    
    console.log('✅ adminController: Analysis deleted successfully');
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('❌ adminController: Admin delete analysis error:', error);
    res.status(500).json({ 
      message: 'Error deleting analysis', 
      error: error.message 
    });
  }
};

// System health check
const getSystemHealth = async (req, res) => {
  console.log('🏥 adminController: getSystemHealth - Admin:', req.user._id);
  
  try {
    const mongoose = require('mongoose');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    console.log('✅ adminController: System health check completed');
    res.json(health);
  } catch (error) {
    console.error('❌ adminController: System health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
};

// TODO: Add more admin controller functions
// const bulkUpdateUsers = async (req, res) => {
//   console.log('👥 adminController: bulkUpdateUsers - Admin:', req.user._id);
//   // TODO: Implement bulk user updates
// };

// const getSystemLogs = async (req, res) => {
//   console.log('📋 adminController: getSystemLogs - Admin:', req.user._id);
//   // TODO: Implement system log retrieval
// };

// const sendBulkEmails = async (req, res) => {
//   console.log('📧 adminController: sendBulkEmails - Admin:', req.user._id);
//   // TODO: Implement bulk email sending functionality
// };

// const getAnalyticsReport = async (req, res) => {
//   console.log('📊 adminController: getAnalyticsReport - Admin:', req.user._id);
//   // TODO: Implement comprehensive analytics reports
// };

// const manageApiKeys = async (req, res) => {
//   console.log('🔑 adminController: manageApiKeys - Admin:', req.user._id);
//   // TODO: Implement API key management for users
// };

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAllFiles,
  getAllAnalyses,
  deleteFile,
  deleteAnalysis,
  getSystemHealth
  // TODO: Export additional functions when implemented
};