const { body, param, query, validationResult } = require('express-validator');

// Debug logging for validation middleware
console.log('Validation middleware loaded');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  console.log('Validation: Handling validation errors');
  console.log('Validation: Request method:', req.method);
  console.log('Validation: Request path:', req.path);
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Validation: Validation failed, errors found:', errors.array().length);
    console.log('Validation: Errors details:', errors.array());
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  console.log('Validation: All validations passed');
  next();
};

// User registration validation
const validateRegistration = [
  console.log('Validation: Setting up registration validation rules'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  console.log('Validation: Registration validation rules configured'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  console.log('Validation: Setting up login validation rules'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  console.log('Validation: Login validation rules configured'),
  handleValidationErrors
];

// User profile update validation
const validateProfileUpdate = [
  console.log('Validation: Setting up profile update validation rules'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  
  body('preferences.defaultChartType')
    .optional()
    .isIn(['line', 'bar', 'scatter', 'pie', 'area'])
    .withMessage('Invalid chart type'),
  
  console.log('Validation: Profile update validation rules configured'),
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  console.log('Validation: Setting up password change validation rules'),
  
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      console.log('Validation: Validating password confirmation');
      if (value !== req.body.newPassword) {
        console.log('Validation: Password confirmation failed');
        throw new Error('Password confirmation does not match new password');
      }
      console.log('Validation: Password confirmation passed');
      return true;
    }),
  
  console.log('Validation: Password change validation rules configured'),
  handleValidationErrors
];

// Analysis creation validation
const validateAnalysisCreation = [
  console.log('Validation: Setting up analysis creation validation rules'),
  
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('fileId')
    .isMongoId()
    .withMessage('Invalid file ID'),
  
  body('configuration.selectedSheet')
    .notEmpty()
    .withMessage('Selected sheet is required'),
  
  body('configuration.xAxis.column')
    .notEmpty()
    .withMessage('X-axis column is required'),
  
  body('configuration.yAxis.column')
    .notEmpty()
    .withMessage('Y-axis column is required'),
  
  body('configuration.chartType')
    .isIn(['line', 'bar', 'scatter', 'pie', 'area', 'bubble', 'radar', 'doughnut', '3d-surface', '3d-scatter', '3d-bar'])
    .withMessage('Invalid chart type'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  console.log('Validation: Analysis creation validation rules configured'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  console.log('Validation: Setting up ObjectId validation for parameter:', paramName),
  
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  console.log('Validation: Setting up pagination validation rules'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'size', 'views', 'downloads'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  console.log('Validation: Pagination validation rules configured'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  console.log('Validation: Setting up search validation rules'),
  
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo'),
  
  console.log('Validation: Search validation rules configured'),
  handleValidationErrors
];

// TODO: Add file upload validation middleware
// TODO: Add file size validation for uploads
// TODO: Add file type validation for Excel files
// TODO: Add analysis configuration validation
// TODO: Add chart configuration validation
// TODO: Add bulk operation validation
// TODO: Add admin operation validation
// TODO: Add API key validation
// TODO: Add webhook validation
// TODO: Add rate limiting validation
// TODO: Add environment-specific validation rules
// TODO: Add custom validation for complex business rules

// Notes:
// - Consider adding internationalization for error messages
// - Implement validation logging for debugging
// - Add validation caching for performance
// - Consider adding validation versioning
// - Implement validation middleware composition
// - Add validation result formatting
// - Consider adding validation metrics and monitoring
// - Implement proper error response formatting
// - Add validation chain composition utilities
// - Consider adding custom validation schemas

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateAnalysisCreation,
  validateObjectId,
  validatePagination,
  validateSearch,
  handleValidationErrors
};