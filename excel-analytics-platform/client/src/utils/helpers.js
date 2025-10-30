// Helper functions for formatting and utilities
// TODO: Consider organizing these into separate modules by functionality

// TODO: Add console logging for utility functions (development mode only)
// const isDevelopment = process.env.NODE_ENV === 'development';

console.log('helpers.js: Loading utility functions for formatting and common operations');

/**
 * Format file size in bytes to human readable format
 * TODO: Add localization support for different number formats
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  // TODO: Add validation for non-numeric inputs
  // if (typeof bytes !== 'number' || bytes < 0) {
  //   console.warn('helpers.js: Invalid bytes value provided to formatFileSize:', bytes);
  //   return '0 Bytes';
  // }

  if (bytes === 0) {
    console.log('helpers.js: formatFileSize called with 0 bytes');
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  console.log(`helpers.js: formatFileSize: ${bytes} bytes -> ${result}`);
  
  return result;
};

/**
 * Format date to human readable format
 * TODO: Add timezone handling and internationalization
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative date
 */
export const formatDate = (dateString) => {
  console.log('helpers.js: formatDate called with:', dateString);
  
  const date = new Date(dateString);
  
  // TODO: Add validation for invalid dates
  // if (isNaN(date.getTime())) {
  //   console.warn('helpers.js: Invalid date string provided:', dateString);
  //   return 'Invalid date';
  // }
  
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let result;
  if (diffDays === 1) {
    result = 'Yesterday';
  } else if (diffDays < 7) {
    result = `${diffDays} days ago`;
  } else {
    result = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  console.log(`helpers.js: formatDate: ${dateString} -> ${result}`);
  return result;
};

/**
 * Format relative time (more granular than formatDate)
 * TODO: Add "time until" functionality for future dates
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  console.log('helpers.js: formatRelativeTime called with:', dateString);
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let result;
  if (diffMinutes < 1) {
    result = 'Just now';
  } else if (diffMinutes < 60) {
    result = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    result = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    result = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    result = date.toLocaleDateString();
  }
  
  console.log(`helpers.js: formatRelativeTime: ${dateString} -> ${result}`);
  return result;
};

/**
 * Format number with commas
 * TODO: Add decimal place control parameter
 * @param {number} num - Number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (num) => {
  console.log('helpers.js: formatNumber called with:', num);
  
  // TODO: Add validation and error handling
  // if (typeof num !== 'number') {
  //   console.warn('helpers.js: Non-numeric value provided to formatNumber:', num);
  //   return '0';
  // }
  
  const result = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  console.log(`helpers.js: formatNumber: ${num} -> ${result}`);
  return result;
};

/**
 * Generate random color
 * TODO: Add custom color palette support
 * @returns {string} Random hex color
 */
export const generateRandomColor = () => {
  console.log('helpers.js: generateRandomColor called');
  
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];
  
  const randomIndex = Math.floor(Math.random() * colors.length);
  const result = colors[randomIndex];
  
  console.log(`helpers.js: generateRandomColor: selected color at index ${randomIndex}: ${result}`);
  return result;
};

/**
 * Truncate text to specified length
 * TODO: Add word boundary awareness to avoid cutting words
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  console.log('helpers.js: truncateText called with text length:', text?.length, 'maxLength:', maxLength);
  
  // TODO: Add parameter validation
  // if (typeof text !== 'string') {
  //   console.warn('helpers.js: Non-string value provided to truncateText:', text);
  //   return '';
  // }
  
  if (text.length <= maxLength) {
    console.log('helpers.js: Text length within limit, no truncation needed');
    return text;
  }
  
  const result = text.substring(0, maxLength) + '...';
  console.log(`helpers.js: truncateText: truncated from ${text.length} to ${result.length} characters`);
  return result;
};

/**
 * Validate email format
 * TODO: Add more comprehensive email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  console.log('helpers.js: isValidEmail called with:', email);
  
  // TODO: Add parameter validation
  // if (typeof email !== 'string') {
  //   console.warn('helpers.js: Non-string value provided to isValidEmail:', email);
  //   return false;
  // }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const result = emailRegex.test(email);
  
  console.log(`helpers.js: isValidEmail: ${email} is ${result ? 'valid' : 'invalid'}`);
  return result;
};

/**
 * Generate chart colors for multiple data points
 * TODO: Add color palette selection parameter
 * @param {number} count - Number of colors needed
 * @returns {Array<string>} Array of colors
 */
export const generateChartColors = (count) => {
  console.log('helpers.js: generateChartColors called with count:', count);
  
  const baseColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',
  ];
  
  // TODO: Add parameter validation
  // if (typeof count !== 'number' || count < 1) {
  //   console.warn('helpers.js: Invalid count provided to generateChartColors:', count);
  //   return [];
  // }
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  console.log(`helpers.js: generateChartColors: generated ${colors.length} colors for ${count} data points`);
  return colors;
};

/**
 * Download blob as file
 * TODO: Add error handling and progress tracking
 * @param {Blob} blob - File blob
 * @param {string} filename - Download filename
 */
export const downloadBlob = (blob, filename) => {
  console.log('helpers.js: downloadBlob called with filename:', filename, 'blob size:', blob?.size);
  
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log('helpers.js: downloadBlob: file downloaded successfully');
  } catch (error) {
    console.error('helpers.js: downloadBlob: error occurred:', error);
    // TODO: Add user-friendly error handling
  }
};

/**
 * Debounce function to limit function calls
 * TODO: Add leading/trailing call options
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  console.log('helpers.js: debounce created with wait time:', wait, 'ms');
  
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get file type icon identifier
 * TODO: Add more file types and custom icons
 * @param {string} filename - Name of file
 * @returns {string} File type identifier
 */
export const getFileTypeIcon = (filename) => {
  console.log('helpers.js: getFileTypeIcon called with filename:', filename);
  
  const extension = filename.split('.').pop().toLowerCase();
  let fileType;
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      fileType = 'excel';
      break;
    case 'csv':
      fileType = 'csv';
      break;
    case 'pdf':
      fileType = 'pdf';
      break;
    case 'doc':
    case 'docx':
      fileType = 'word';
      break;
    default:
      fileType = 'file';
  }
  
  console.log(`helpers.js: getFileTypeIcon: ${filename} identified as ${fileType}`);
  return fileType;
};

/**
 * Calculate percentage
 * TODO: Add decimal place control
 * @param {number} value - Value portion
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  console.log('helpers.js: calculatePercentage called with value:', value, 'total:', total);
  
  // TODO: Add parameter validation
  // if (typeof value !== 'number' || typeof total !== 'number') {
  //   console.warn('helpers.js: Non-numeric values provided to calculatePercentage:', { value, total });
  //   return 0;
  // }
  
  if (total === 0) {
    console.warn('helpers.js: calculatePercentage called with total = 0');
    return 0;
  }
  
  const result = Math.round((value / total) * 100);
  console.log(`helpers.js: calculatePercentage: ${value}/${total} = ${result}%`);
  return result;
};

/**
 * Format duration in seconds to human readable
 * TODO: Add milliseconds support
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  console.log('helpers.js: formatDuration called with seconds:', seconds);
  
  // TODO: Add parameter validation
  // if (typeof seconds !== 'number' || seconds < 0) {
  //   console.warn('helpers.js: Invalid seconds value provided:', seconds);
  //   return '0s';
  // }
  
  let result;
  if (seconds < 60) {
    result = `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    result = remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    result = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  console.log(`helpers.js: formatDuration: ${seconds} seconds -> ${result}`);
  return result;
};

/**
 * Deep clone object using JSON
 * TODO: Handle circular references and special objects
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  console.log('helpers.js: deepClone called with object:', typeof obj);
  
  try {
    const result = JSON.parse(JSON.stringify(obj));
    console.log('helpers.js: deepClone: object cloned successfully');
    return result;
  } catch (error) {
    console.error('helpers.js: deepClone: failed to clone object:', error);
    // TODO: Return shallow clone as fallback
    return obj;
  }
};

/**
 * Check if object is empty
 * TODO: Handle different types of empty values
 * @param {any} obj - Object to check
 * @returns {boolean} Is object empty
 */
export const isEmpty = (obj) => {
  console.log('helpers.js: isEmpty called with:', typeof obj);
  
  const result = Object.keys(obj).length === 0;
  console.log(`helpers.js: isEmpty: object is ${result ? 'empty' : 'not empty'}`);
  return result;
};

/**
 * Capitalize first letter of string
 * TODO: Add handling for non-string inputs
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  console.log('helpers.js: capitalize called with:', str);
  
  // TODO: Add parameter validation
  // if (typeof str !== 'string') {
  //   console.warn('helpers.js: Non-string value provided to capitalize:', str);
  //   return '';
  // }
  
  const result = str.charAt(0).toUpperCase() + str.slice(1);
  console.log(`helpers.js: capitalize: "${str}" -> "${result}"`);
  return result;
};

/**
 * Get contrast color for text based on background color
 * TODO: Add WCAG compliance checking
 * @param {string} hexcolor - Hex color code
 * @returns {string} Contrast color (black or white)
 */
export const getContrastColor = (hexcolor) => {
  console.log('helpers.js: getContrastColor called with:', hexcolor);
  
  // Remove # if present
  hexcolor = hexcolor.replace('#', '');
  
  // TODO: Add color format validation
  // if (hexcolor.length !== 6) {
  //   console.warn('helpers.js: Invalid hex color format:', hexcolor);
  //   return '#000000';
  // }
  
  // Convert to RGB
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  const result = luminance > 0.5 ? '#000000' : '#ffffff';
  console.log(`helpers.js: getContrastColor: ${hexcolor} -> ${result} (luminance: ${luminance.toFixed(2)})`);
  return result;
};

// TODO: Add more utility functions
// export const generateId = () => Math.random().toString(36).substr(2, 9);
// export const groupBy = (array, key) => array.reduce((groups, item) => ({...groups, [item[key]]: [...(groups[item[key]] || []), item]}), {});
// export const unique = (array) => [...new Set(array)];
// export const sortBy = (array, key, direction = 'asc') => [...array].sort((a, b) => direction === 'asc' ? a[key] - b[key] : b[key] - a[key]);

console.log('helpers.js: All utility functions loaded successfully');