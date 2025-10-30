const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Debug logging for auth middleware operations
console.log('Auth middleware loaded');

// Verify JWT token
const auth = async (req, res, next) => {
  console.log('Auth middleware: Starting authentication process');
  console.log('Auth middleware: Request headers:', req.headers);
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware: Extracted token:', token ? 'Token found' : 'No token provided');
    
    if (!token) {
      console.log('Auth middleware: No token provided, access denied');
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    console.log('Auth middleware: Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Token decoded successfully, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Auth middleware: User fetched from database:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('Auth middleware: Token is not valid - user not found');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      console.log('Auth middleware: User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    console.log('Auth middleware: Authentication successful, attaching user to request');
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.log('Auth middleware: Authentication failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Verify admin role
const adminAuth = async (req, res, next) => {
  console.log('Admin auth middleware: Starting admin authentication');
  
  try {
    console.log('Admin auth middleware: Calling base auth middleware first');
    await auth(req, res, () => {
      console.log('Admin auth middleware: Base auth completed, checking admin role');
      console.log('Admin auth middleware: User role:', req.user?.role);
      
      if (req.user && req.user.role === 'admin') {
        console.log('Admin auth middleware: Admin access granted');
        next();
      } else {
        console.log('Admin auth middleware: Access denied - admin role required');
        res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    console.log('Admin auth middleware: Authentication failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional auth - for public endpoints that can benefit from user context
const optionalAuth = async (req, res, next) => {
  console.log('Optional auth middleware: Starting optional authentication');
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Optional auth middleware: Checking for token:', token ? 'Token provided' : 'No token');
    
    if (token) {
      console.log('Optional auth middleware: Attempting to verify token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      console.log('Optional auth middleware: User lookup result:', user ? 'User found' : 'User not found');
      
      if (user && user.isActive) {
        console.log('Optional auth middleware: User context attached to request');
        req.user = user;
      } else {
        console.log('Optional auth middleware: Invalid or inactive user, continuing without context');
      }
    }
    
    console.log('Optional auth middleware: Proceeding to next middleware');
    next();
  } catch (error) {
    console.log('Optional auth middleware: Token invalid, continuing without user context');
    // Continue without user context if token is invalid
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  console.log('Token generation: Creating token for userId:', userId);
  console.log('Token generation: Using JWT_SECRET configured:', !!process.env.JWT_SECRET);
  
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
  
  console.log('Token generation: Token created successfully');
  return token;
};

// TODO: Implement refresh token mechanism for enhanced security
// TODO: Add rate limiting for authentication attempts
// TODO: Implement token blacklisting for logout functionality
// TODO: Add IP-based authentication rate limiting
// TODO: Consider implementing JWT token rotation
// TODO: Add support for multiple token types (access/refresh)
// TODO: Implement proper session management
// TODO: Add audit logging for authentication events

// Notes: 
// - Consider implementing token refresh mechanism in production
// - Add proper error logging and monitoring
// - Consider implementing IP-based rate limiting
// - JWT tokens should be stored securely (HttpOnly cookies recommended)
// - Implement token blacklisting for better security during logout
// - Add proper logging for security events (failed logins, etc.)

module.exports = {
  auth,
  adminAuth,
  optionalAuth,
  generateToken
};