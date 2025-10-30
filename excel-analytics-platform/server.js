const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 Server starting up...');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

console.log('📦 Routes imported successfully');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  console.log('💚 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Excel Analytics Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/health`);
});

module.exports = app;