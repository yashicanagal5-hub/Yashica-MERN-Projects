const mongoose = require('mongoose');

console.log('Chart model loaded');

// MongoDB schema for chart documents
const chartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['line', 'bar', 'scatter', 'pie', 'area', 'bubble', 'radar', 'doughnut', '3d-surface', '3d-scatter', '3d-bar'],
    required: true
  },
  configuration: {
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    },
    responsive: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'colorful'],
      default: 'light'
    },
    colors: [String],
    title: {
      text: String,
      fontSize: {
        type: Number,
        default: 16
      },
      color: {
        type: String,
        default: '#333'
      }
    },
    axes: {
      x: {
        label: String,
        showGrid: {
          type: Boolean,
          default: true
        },
        tickRotation: {
          type: Number,
          default: 0
        }
      },
      y: {
        label: String,
        showGrid: {
          type: Boolean,
          default: true
        },
        min: Number,
        max: Number
      }
    },
    legend: {
      show: {
        type: Boolean,
        default: true
      },
      position: {
        type: String,
        enum: ['top', 'bottom', 'left', 'right'],
        default: 'top'
      }
    },
    animations: {
      enabled: {
        type: Boolean,
        default: true
      },
      duration: {
        type: Number,
        default: 750
      }
    }
  },
  data: {
    labels: [String],
    datasets: [{
      label: String,
      data: [mongoose.Schema.Types.Mixed],
      backgroundColor: [String],
      borderColor: [String],
      borderWidth: Number,
      fill: Boolean
    }]
  },
  exports: [{
    format: {
      type: String,
      enum: ['png', 'jpg', 'pdf', 'svg']
    },
    url: String,
    size: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
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

console.log('Chart schema defined');

// Indexes for efficient queries
console.log('Chart: Creating database indexes...');
chartSchema.index({ userId: 1, createdAt: -1 });
chartSchema.index({ analysisId: 1 });
chartSchema.index({ type: 1 });
chartSchema.index({ isPublic: 1, createdAt: -1 });
chartSchema.index({ tags: 1 });
chartSchema.index({ 'rating.average': -1 });
console.log('Chart: Indexes created successfully');

// TODO: Add chart template management
// TODO: Implement chart versioning
// TODO: Add chart gallery and sharing
// TODO: Implement chart collaboration
// TODO: Add chart export presets
// TODO: Implement chart theme system
// TODO: Add chart performance optimization
// TODO: Implement chart caching
// TODO: Add chart analytics and usage tracking
// TODO: Implement chart backup and restore
// TODO: Add chart metadata for SEO
// TODO: Implement chart search and discovery

// Instance methods
chartSchema.methods.updateConfiguration = function(newConfig) {
  console.log('Chart: Updating configuration for chart:', this._id);
  console.log('Chart: Previous configuration:', this.configuration);
  
  this.configuration = { ...this.configuration, ...newConfig };
  console.log('Chart: New configuration:', this.configuration);
  
  return this.save();
};

chartSchema.methods.updateData = function(newData) {
  console.log('Chart: Updating data for chart:', this._id);
  console.log('Chart: Previous data structure:', {
    labels: this.data.labels?.length,
    datasets: this.data.datasets?.length
  });
  
  this.data = newData;
  console.log('Chart: New data structure:', {
    labels: newData.labels?.length,
    datasets: newData.datasets?.length
  });
  
  return this.save();
};

chartSchema.methods.addExport = function(format, url, size) {
  console.log('Chart: Adding export for chart:', this._id);
  console.log('Chart: Export details:', { format, url, size });
  
  this.exports.push({
    format,
    url,
    size,
    createdAt: new Date()
  });
  
  return this.save();
};

chartSchema.methods.incrementViewCount = function() {
  console.log('Chart: Incrementing view count for chart:', this._id);
  this.viewCount += 1;
  return this.save();
};

chartSchema.methods.incrementDownloadCount = function() {
  console.log('Chart: Incrementing download count for chart:', this._id);
  this.downloadCount += 1;
  return this.save();
};

chartSchema.methods.updateRating = function(newRating) {
  console.log('Chart: Updating rating for chart:', this._id);
  console.log('Chart: New rating:', newRating);
  
  const currentCount = this.rating.count;
  const currentAverage = this.rating.average;
  const newCount = currentCount + 1;
  const newAverage = ((currentAverage * currentCount) + newRating) / newCount;
  
  this.rating.count = newCount;
  this.rating.average = Math.round(newAverage * 100) / 100; // Round to 2 decimal places
  
  console.log('Chart: Rating updated:', {
    count: this.rating.count,
    average: this.rating.average
  });
  
  return this.save();
};

// Static methods
chartSchema.statics.findByUser = function(userId, options = {}) {
  console.log('Chart: Finding charts by user:', userId);
  const query = { userId };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  if (options.analysisId) {
    query.analysisId = options.analysisId;
  }
  
  return this.find(query)
    .populate('analysisId', 'title')
    .sort({ createdAt: -1 });
};

chartSchema.statics.findPublicCharts = function(options = {}) {
  console.log('Chart: Finding public charts');
  const query = { isPublic: true };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  if (options.minRating) {
    query['rating.average'] = { $gte: options.minRating };
  }
  
  return this.find(query)
    .populate('userId', 'name')
    .populate('analysisId', 'title')
    .sort({ 'rating.average': -1, createdAt: -1 });
};

chartSchema.statics.findByAnalysis = function(analysisId) {
  console.log('Chart: Finding charts by analysis:', analysisId);
  return this.find({ analysisId })
    .populate('userId', 'name')
    .sort({ createdAt: 1 });
};

chartSchema.statics.getPopularCharts = function(limit = 10) {
  console.log('Chart: Finding popular charts, limit:', limit);
  return this.find({ isPublic: true })
    .populate('userId', 'name')
    .populate('analysisId', 'title')
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit);
};

// Virtual methods
chartSchema.virtual('exportUrl').get(function() {
  if (this.exports && this.exports.length > 0) {
    return this.exports[this.exports.length - 1].url;
  }
  return null;
});

chartSchema.virtual('hasData').get(function() {
  return this.data && 
         this.data.labels && 
         this.data.labels.length > 0 && 
         this.data.datasets && 
         this.data.datasets.length > 0;
});

// Pre-save middleware
chartSchema.pre('save', function(next) {
  console.log('Chart: Pre-save middleware triggered for chart:', this._id);
  
  // Ensure data structure is valid
  if (!this.data || !Array.isArray(this.data.labels) || !Array.isArray(this.data.datasets)) {
    console.log('Chart: Invalid data structure, setting defaults');
    this.data = {
      labels: [],
      datasets: []
    };
  }
  
  // Ensure configuration has required fields
  if (!this.configuration) {
    console.log('Chart: No configuration provided, setting defaults');
    this.configuration = {
      width: 800,
      height: 600,
      responsive: true,
      theme: 'light'
    };
  }
  
  next();
});

// Post-save middleware
chartSchema.post('save', function(doc) {
  console.log('Chart: Post-save middleware triggered for chart:', doc._id);
  console.log('Chart: Chart saved with type:', doc.type);
  console.log('Chart: Public status:', doc.isPublic);
  console.log('Chart: View count:', doc.viewCount);
});

// Notes:
// - Consider adding chart image optimization
// - Implement proper data validation for chart types
// - Add chart usage analytics
// - Consider chart sharing and embedding features
// - Implement chart performance monitoring
// - Add chart accessibility features
// - Consider real-time chart updates
// - Implement chart collaboration features
// - Add chart export format validation
// - Consider chart theme inheritance from analysis

module.exports = mongoose.model('Chart', chartSchema);