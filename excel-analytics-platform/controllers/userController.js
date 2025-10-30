const User = require('../models/User');
const UploadedFile = require('../models/UploadedFile');
const Analysis = require('../models/Analysis');

// TODO: Add input validation middleware
// const { validateUserUpdate } = require('../middleware/validation');

console.log('📋 userController: Loading user management controllers');

// Get user profile (same as auth controller but with additional details)
const getProfile = async (req, res) => {
  console.log('📋 userController: getProfile - Fetching user profile for user:', req.user._id);
  
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.log('❌ userController: User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ userController: Found user, fetching statistics...');
    
    // Get user statistics
    const [fileStats, analysisStats] = await Promise.all([
      UploadedFile.aggregate([
        { $match: { uploadedBy: user._id } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            completedFiles: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            processingFiles: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
            },
            errorFiles: {
              $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
            }
          }
        }
      ]),
      Analysis.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const fileStatistics = fileStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      completedFiles: 0,
      processingFiles: 0,
      errorFiles: 0
    };
    
    const analysisStatistics = analysisStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { completed: 0, pending: 0, processing: 0, error: 0 });
    
    console.log('📊 userController: Statistics retrieved - Files:', fileStatistics.totalFiles, 'Analyses:', Object.values(analysisStatistics).reduce((a, b) => a + b, 0));
    
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        stats: {
          ...user.stats,
          files: fileStatistics,
          analyses: analysisStatistics
        }
      }
    };
    
    console.log('✅ userController: getProfile completed successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ userController: Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  console.log('⚙️ userController: updatePreferences - User:', req.user._id);
  
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      console.log('⚠️ userController: No preferences provided in request body');
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    console.log('📝 userController: Updating preferences:', preferences);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        preferences: {
          ...req.user.preferences,
          ...preferences
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('✅ userController: Preferences updated successfully');
    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('❌ userController: Update preferences error:', error);
    res.status(500).json({ 
      message: 'Error updating preferences', 
      error: error.message 
    });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  console.log('📊 userController: getDashboard - User:', req.user._id);
  
  try {
    const userId = req.user._id;
    
    // Get recent files
    console.log('📁 userController: Fetching recent files...');
    const recentFiles = await UploadedFile.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName size status createdAt metadata');
    
    // Get recent analyses
    console.log('📈 userController: Fetching recent analyses...');
    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fileId', 'originalName')
      .select('title status createdAt configuration.chartType processingTime');
    
    // Get activity data for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    console.log('📊 userController: Fetching activity data from last 30 days...');
    const activityData = await UploadedFile.aggregate([
      {
        $match: {
          uploadedBy: userId,
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
          fileCount: { $sum: 1 },
          totalSize: { $sum: "$size" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get chart type distribution
    console.log('📊 userController: Fetching chart type distribution...');
    const chartTypeDistribution = await Analysis.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$configuration.chartType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get storage usage by file type
    console.log('💾 userController: Fetching storage usage by file type...');
    const storageByType = await UploadedFile.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: "$mimetype",
          totalSize: { $sum: "$size" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSize: -1 } }
    ]);
    
    console.log(`✅ userController: Dashboard data loaded - Files: ${recentFiles.length}, Analyses: ${recentAnalyses.length}, Activity points: ${activityData.length}`);
    
    res.json({
      recentFiles,
      recentAnalyses,
      activityData,
      chartTypeDistribution,
      storageByType
    });
  } catch (error) {
    console.error('❌ userController: Get dashboard error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
};

// Get user activity history
const getActivityHistory = async (req, res) => {
  console.log('📜 userController: getActivityHistory - User:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      type // 'file' or 'analysis'
    } = req.query;
    
    const userId = req.user._id;
    let activities = [];
    
    // Date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    console.log('🔍 userController: Activity filters - Type:', type, 'Page:', page, 'Limit:', limit);
    
    // Get file activities
    if (!type || type === 'file') {
      console.log('📁 userController: Fetching file activities...');
      const fileActivities = await UploadedFile.find({
        uploadedBy: userId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      })
      .sort({ createdAt: -1 })
      .limit(type === 'file' ? limit * 1 : Math.ceil(limit / 2))
      .skip(type === 'file' ? (page - 1) * limit : 0)
      .select('originalName size status createdAt');
      
      activities.push(...fileActivities.map(file => ({
        type: 'file',
        action: 'upload',
        title: file.originalName,
        status: file.status,
        size: file.size,
        createdAt: file.createdAt,
        id: file._id
      })));
    }
    
    // Get analysis activities
    if (!type || type === 'analysis') {
      console.log('📈 userController: Fetching analysis activities...');
      const analysisActivities = await Analysis.find({
        userId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      })
      .sort({ createdAt: -1 })
      .limit(type === 'analysis' ? limit * 1 : Math.ceil(limit / 2))
      .skip(type === 'analysis' ? (page - 1) * limit : 0)
      .populate('fileId', 'originalName')
      .select('title status createdAt configuration.chartType processingTime fileId');
      
      activities.push(...analysisActivities.map(analysis => ({
        type: 'analysis',
        action: 'create',
        title: analysis.title,
        status: analysis.status,
        chartType: analysis.configuration.chartType,
        fileName: analysis.fileId?.originalName,
        processingTime: analysis.processingTime,
        createdAt: analysis.createdAt,
        id: analysis._id
      })));
    }
    
    // Sort all activities by date
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination if not filtered by type
    if (!type) {
      const startIndex = (page - 1) * limit;
      activities = activities.slice(startIndex, startIndex + limit);
    }
    
    // Get total count for pagination
    let total = 0;
    if (type === 'file') {
      total = await UploadedFile.countDocuments({
        uploadedBy: userId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      });
    } else if (type === 'analysis') {
      total = await Analysis.countDocuments({
        userId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      });
    } else {
      const [fileCount, analysisCount] = await Promise.all([
        UploadedFile.countDocuments({
          uploadedBy: userId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }),
        Analysis.countDocuments({
          userId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
      ]);
      total = fileCount + analysisCount;
    }
    
    console.log(`✅ userController: Activity history loaded - ${activities.length} activities, total: ${total}`);
    
    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ userController: Get activity history error:', error);
    res.status(500).json({ 
      message: 'Error fetching activity history', 
      error: error.message 
    });
  }
};

// Get user favorites/bookmarks
const getFavorites = async (req, res) => {
  console.log('⭐ userController: getFavorites - User:', req.user._id);
  
  try {
    const userId = req.user._id;
    
    // Get bookmarked analyses
    console.log('📌 userController: Fetching bookmarked analyses...');
    const favoriteAnalyses = await Analysis.find({
      bookmarkedBy: userId
    })
    .populate('userId', 'name')
    .populate('fileId', 'originalName')
    .select('title description configuration.chartType status createdAt isPublic viewCount')
    .sort({ createdAt: -1 });
    
    console.log(`✅ userController: Favorites loaded - ${favoriteAnalyses.length} bookmarked analyses`);
    
    res.json({
      favoriteAnalyses
    });
  } catch (error) {
    console.error('❌ userController: Get favorites error:', error);
    res.status(500).json({ 
      message: 'Error fetching favorites', 
      error: error.message 
    });
  }
};

// Toggle bookmark on analysis
const toggleBookmark = async (req, res) => {
  console.log('🔖 userController: toggleBookmark - User:', req.user._id, 'Analysis:', req.params.analysisId);
  
  try {
    const { analysisId } = req.params;
    const userId = req.user._id;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      console.log('❌ userController: Analysis not found:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    const isBookmarked = analysis.bookmarkedBy.includes(userId);
    
    if (isBookmarked) {
      // Remove bookmark
      console.log('📌 userController: Removing bookmark for analysis:', analysisId);
      await Analysis.findByIdAndUpdate(analysisId, {
        $pull: { bookmarkedBy: userId }
      });
    } else {
      // Add bookmark
      console.log('🔖 userController: Adding bookmark for analysis:', analysisId);
      await Analysis.findByIdAndUpdate(analysisId, {
        $addToSet: { bookmarkedBy: userId }
      });
    }
    
    const action = isBookmarked ? 'removed' : 'added';
    console.log(`✅ userController: Bookmark ${action} successfully for analysis: ${analysisId}`);
    
    res.json({
      message: `Bookmark ${action}`,
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('❌ userController: Toggle bookmark error:', error);
    res.status(500).json({ 
      message: 'Error toggling bookmark', 
      error: error.message 
    });
  }
};

// TODO: Add more user controller functions
// const deleteAccount = async (req, res) => {
//   console.log('🗑️ userController: deleteAccount - User:', req.user._id);
//   // TODO: Implement account deletion with user consent
// };

// const exportUserData = async (req, res) => {
//   console.log('📤 userController: exportUserData - User:', req.user._id);
//   // TODO: Implement GDPR data export functionality
// };

// const getUsageLimits = async (req, res) => {
//   console.log('📊 userController: getUsageLimits - User:', req.user._id);
//   // TODO: Implement usage tracking and limits
// };

module.exports = {
  getProfile,
  updatePreferences,
  getDashboard,
  getActivityHistory,
  getFavorites,
  toggleBookmark
  // TODO: Export additional functions when implemented
};