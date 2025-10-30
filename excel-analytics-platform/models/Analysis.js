const mongoose = require('mongoose');

console.log('Analysis model loaded');

// MongoDB schema for analysis documents
const analysisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  configuration: {
    selectedSheet: {
      type: String,
      required: true
    },
    xAxis: {
      column: String,
      label: String,
      dataType: String
    },
    yAxis: {
      column: String,
      label: String,
      dataType: String
    },
    chartType: {
      type: String,
      enum: ['line', 'bar', 'scatter', 'pie', 'area', 'bubble', 'radar', 'doughnut', '3d-surface', '3d-scatter', '3d-bar'],
      required: true
    },
    filters: {
      type: Object,
      default: {}
    },
    groupBy: {
      type: String,
      default: null
    },
    aggregation: {
      type: String,
      enum: ['sum', 'average', 'count', 'min', 'max', 'median'],
      default: 'sum'
    },
    customizations: {
      colors: [String],
      title: String,
      theme: {
        type: String,
        enum: ['light', 'dark', 'colorful'],
        default: 'light'
      },
      showLegend: {
        type: Boolean,
        default: true
      },
      showGrid: {
        type: Boolean,
        default: true
      },
      animations: {
        type: Boolean,
        default: true
      }
    }
  },
  results: {
    processedData: {
      type: Object,
      default: {}
    },
    statistics: {
      total: Number,
      average: Number,
      median: Number,
      mode: Number,
      min: Number,
      max: Number,
      standardDeviation: Number,
      correlation: Number
    },
    insights: [{
      type: String,
      category: {
        type: String,
        enum: ['trend', 'outlier', 'correlation', 'pattern', 'anomaly']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    chartImage: {
      type: String,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  error: {
    type: String,
    default: null
  },
  processingTime: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

console.log('Analysis schema defined');

// Indexes for efficient queries
console.log('Analysis: Creating database indexes...');
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ fileId: 1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ isPublic: 1, createdAt: -1 });
analysisSchema.index({ tags: 1 });
console.log('Analysis: Indexes created successfully');

// Update user stats when analysis is completed
analysisSchema.post('save', async function() {
  console.log('Analysis: Post-save hook triggered for analysis:', this._id);
  console.log('Analysis: Current status:', this.status);
  
  if (this.status === 'completed') {
    console.log('Analysis: Analysis completed, updating user stats...');
    try {
      const User = mongoose.model('User');
      console.log('Analysis: Updating user stats for userId:', this.userId);
      
      await User.findByIdAndUpdate(this.userId, {
        $inc: { 'stats.totalAnalyses': 1 }
      });
      
      console.log('Analysis: User stats updated successfully');
    } catch (error) {
      console.error('Error updating user analysis stats:', error);
    }
  } else {
    console.log('Analysis: Analysis not completed, skipping user stats update');
  }
});

// TODO: Add pre-save validation for configuration
// TODO: Implement analysis versioning
// TODO: Add analysis templates and sharing
// TODO: Implement analysis execution history
// TODO: Add analysis performance monitoring
// TODO: Implement analysis scheduling
// TODO: Add collaborative analysis features
// TODO: Implement analysis export functionality
// TODO: Add analysis backup and restore
// TODO: Implement analysis audit trail
// TODO: Add analysis dependency tracking
// TODO: Implement analysis caching mechanism

// Instance methods
analysisSchema.methods.markAsProcessing = function() {
  console.log('Analysis: Marking analysis as processing:', this._id);
  this.status = 'processing';
  this.error = null;
  return this.save();
};

analysisSchema.methods.markAsCompleted = function(processedData, statistics, insights) {
  console.log('Analysis: Marking analysis as completed:', this._id);
  this.status = 'completed';
  this.results.processedData = processedData;
  this.results.statistics = statistics;
  this.results.insights = insights;
  this.error = null;
  return this.save();
};

analysisSchema.methods.markAsError = function(errorMessage) {
  console.log('Analysis: Marking analysis as error:', this._id);
  console.log('Analysis: Error message:', errorMessage);
  this.status = 'error';
  this.error = errorMessage;
  return this.save();
};

analysisSchema.methods.incrementViewCount = function() {
  console.log('Analysis: Incrementing view count for analysis:', this._id);
  this.viewCount += 1;
  return this.save();
};

// Static methods
analysisSchema.statics.findByUser = function(userId, options = {}) {
  console.log('Analysis: Finding analyses by user:', userId);
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  return this.find(query)
    .populate('fileId', 'originalName size')
    .sort({ createdAt: -1 });
};

analysisSchema.statics.findPublicAnalyses = function(options = {}) {
  console.log('Analysis: Finding public analyses');
  const query = { isPublic: true };
  
  if (options.chartType) {
    query['configuration.chartType'] = options.chartType;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  return this.find(query)
    .populate('userId', 'name')
    .populate('fileId', 'originalName size')
    .sort({ createdAt: -1 });
};

// Notes:
// - Consider adding analysis result caching
// - Implement proper error handling for complex operations
// - Add validation hooks for configuration changes
// - Consider adding analysis metadata for search optimization
// - Implement proper cleanup for failed analyses
// - Add analysis execution time tracking
// - Consider adding analysis resource usage monitoring
// - Implement proper indexing for frequently queried fields
// - Add analysis sharing and collaboration features

module.exports = mongoose.model('Analysis', analysisSchema);