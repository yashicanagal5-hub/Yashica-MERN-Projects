const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

console.log('🔐 authController: Loading authentication controllers');

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Register new user
const register = async (req, res) => {
  console.log('🆕 authController: register - Attempting registration');
  
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 authController: Registration data - Name:', name, 'Email:', email);
    
    // Check if user already exists
    console.log('🔍 authController: Checking if user already exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ authController: User already exists with email:', email);
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }
    
    // Create new user
    console.log('👤 authController: Creating new user...');
    const user = new User({
      name,
      email,
      password
    });
    
    console.log('💾 authController: Saving user to database...');
    await user.save();
    
    // Generate token
    console.log('🎫 authController: Generating JWT token...');
    const token = generateToken(user._id);
    
    console.log('✅ authController: User registered successfully:', user._id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('❌ authController: Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  console.log('🔑 authController: login - Attempting login');
  
  try {
    const { email, password } = req.body;
    
    console.log('📧 authController: Login attempt for email:', email);
    
    // Find user and include password for comparison
    console.log('🔍 authController: Finding user by email...');
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ authController: User not found with email:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      console.log('🔒 authController: Account is deactivated for user:', email);
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }
    
    // Check password
    console.log('🔐 authController: Validating password...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ authController: Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Update last login
    console.log('📅 authController: Updating last login timestamp...');
    await user.updateLastLogin();
    
    // Generate token
    console.log('🎫 authController: Generating JWT token...');
    const token = generateToken(user._id);
    
    console.log('✅ authController: Login successful for user:', email);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ authController: Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  console.log('👤 authController: getProfile - User:', req.user.id);
  
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'stats',
        select: 'totalUploads totalAnalyses storageUsed'
      });
    
    if (!user) {
      console.log('❌ authController: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ authController: Profile retrieved successfully');
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        stats: user.stats,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ authController: Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  console.log('✏️ authController: updateProfile - User:', req.user.id);
  
  try {
    const { name, preferences } = req.body;
    const updates = {};
    
    if (name) {
      updates.name = name;
      console.log('📝 authController: Updating name to:', name);
    }
    if (preferences) {
      updates.preferences = {
        ...req.user.preferences,
        ...preferences
      };
      console.log('⚙️ authController: Updating preferences');
    }
    
    console.log('💾 authController: Updating user profile...');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      console.log('❌ authController: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ authController: Profile updated successfully');
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('❌ authController: Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  console.log('🔒 authController: changePassword - User:', req.user.id);
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔐 authController: Attempting password change...');
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      console.log('❌ authController: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    console.log('🔍 authController: Verifying current password...');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      console.log('❌ authController: Current password is invalid');
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    console.log('🔑 authController: Setting new password...');
    user.password = newPassword;
    await user.save();
    
    console.log('✅ authController: Password changed successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ authController: Change password error:', error);
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  console.log('👋 authController: logout - User:', req.user.id);
  
  try {
    // In a more advanced implementation, you might want to blacklist the token
    console.log('✅ authController: Logout successful (token handled client-side)');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('❌ authController: Logout error:', error);
    res.status(500).json({ 
      message: 'Error during logout', 
      error: error.message 
    });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  console.log('✅ authController: verifyToken - Token verification for user:', req.user.id);
  
  try {
    // If we reach here, the auth middleware has already verified the token
    console.log('✅ authController: Token is valid');
    
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('❌ authController: Token verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying token', 
      error: error.message 
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  console.log('📊 authController: getUserStats - User:', req.user.id);
  
  try {
    const UploadedFile = require('../models/UploadedFile');
    const Analysis = require('../models/Analysis');
    
    console.log('📈 authController: Fetching user statistics...');
    
    const [fileStats, analysisStats] = await Promise.all([
      UploadedFile.aggregate([
        { $match: { uploadedBy: req.user.id } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' }
          }
        }
      ]),
      Analysis.aggregate([
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const stats = {
      files: fileStats[0] || { totalFiles: 0, totalSize: 0, avgSize: 0 },
      analyses: analysisStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { completed: 0, pending: 0, processing: 0, error: 0 }),
      user: req.user.stats
    };
    
    console.log('✅ authController: User statistics retrieved successfully');
    
    res.json({ stats });
  } catch (error) {
    console.error('❌ authController: Get user stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching user statistics', 
      error: error.message 
    });
  }
};

// TODO: Add more authentication controller functions
// const refreshToken = async (req, res) => {
//   console.log('🔄 authController: refreshToken - User:', req.user.id);
//   // TODO: Implement token refresh functionality
// };

// const forgotPassword = async (req, res) => {
//   console.log('📧 authController: forgotPassword - Email:', req.body.email);
//   // TODO: Implement forgot password functionality
// };

// const resetPassword = async (req, res) => {
//   console.log('🔑 authController: resetPassword - Token validation');
//   // TODO: Implement password reset with token
// };

// const verifyEmail = async (req, res) => {
//   console.log('✅ authController: verifyEmail - Token:', req.params.token);
//   // TODO: Implement email verification
// };

// const resendVerification = async (req, res) => {
//   console.log('📧 authController: resendVerification - User:', req.user.id);
//   // TODO: Implement email verification resend
// };

// const enable2FA = async (req, res) => {
//   console.log('🔐 authController: enable2FA - User:', req.user.id);
//   // TODO: Implement two-factor authentication setup
// };

// const disable2FA = async (req, res) => {
//   console.log('🔓 authController: disable2FA - User:', req.user.id);
//   // TODO: Implement two-factor authentication disable
// };

// const validate2FA = async (req, res) => {
//   console.log('🔐 authController: validate2FA - User:', req.user.id);
//   // TODO: Implement two-factor authentication validation
// };

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  getUserStats,
  authLimiter
  // TODO: Export additional functions when implemented
};