const fs = require('fs-extra');
const path = require('path');

// Debug logging for chart generator service
console.log('Chart generator service loaded');

// Generate chart configuration for Chart.js
const generateChartConfig = (type, data, options = {}) => {
  console.log('Chart generator: Starting chart configuration generation');
  console.log('Chart generator: Chart type:', type);
  console.log('Chart generator: Data structure:', {
    labels: data.labels?.length,
    datasets: data.datasets?.length
  });
  console.log('Chart generator: Options:', options);
  
  const {
    title = '',
    theme = 'light',
    showLegend = true,
    showGrid = true,
    animations = true,
    colors = null,
    responsive = true
  } = options;

  const baseConfig = {
    type: type,
    data: data,
    options: {
      responsive: responsive,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          },
          color: theme === 'dark' ? '#fff' : '#333'
        },
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            color: theme === 'dark' ? '#fff' : '#333',
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          titleColor: theme === 'dark' ? '#fff' : '#333',
          bodyColor: theme === 'dark' ? '#fff' : '#333',
          borderColor: theme === 'dark' ? '#555' : '#ddd',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true
        }
      },
      animation: {
        duration: animations ? 750 : 0,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  };

  console.log('Chart generator: Base configuration created');

  // Apply custom colors if provided
  if (colors && data.datasets) {
    console.log('Chart generator: Applying custom colors');
    data.datasets.forEach((dataset, index) => {
      if (colors[index]) {
        dataset.backgroundColor = colors[index];
        dataset.borderColor = colors[index];
        console.log(`Chart generator: Applied color to dataset ${index}`);
      }
    });
  }

  // Customize based on chart type
  console.log('Chart generator: Applying chart-type specific configurations');
  switch (type) {
    case 'line':
      return generateLineChartConfig(baseConfig, options);
    case 'bar':
      return generateBarChartConfig(baseConfig, options);
    case 'scatter':
      return generateScatterChartConfig(baseConfig, options);
    case 'pie':
    case 'doughnut':
      return generatePieChartConfig(baseConfig, options);
    case 'area':
      return generateAreaChartConfig(baseConfig, options);
    case 'radar':
      return generateRadarChartConfig(baseConfig, options);
    case 'bubble':
      return generateBubbleChartConfig(baseConfig, options);
    default:
      console.log('Chart generator: Using base configuration for unknown chart type');
      return baseConfig;
  }
};

// Line chart specific configuration
const generateLineChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring line chart');
  const { showGrid = true, tension = 0.4 } = options;
  
  baseConfig.options.scales = {
    x: {
      display: true,
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    },
    y: {
      display: true,
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    }
  };

  // Apply tension to datasets
  if (baseConfig.data.datasets) {
    console.log('Chart generator: Applying line chart tension:', tension);
    baseConfig.data.datasets.forEach(dataset => {
      dataset.tension = tension;
      dataset.fill = false;
    });
  }

  console.log('Chart generator: Line chart configuration completed');
  return baseConfig;
};

// Bar chart specific configuration
const generateBarChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring bar chart');
  const { showGrid = true, indexAxis = 'x' } = options;
  
  baseConfig.options.indexAxis = indexAxis;
  baseConfig.options.scales = {
    x: {
      display: true,
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    },
    y: {
      display: true,
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    }
  };

  console.log('Chart generator: Bar chart configuration completed');
  return baseConfig;
};

// Scatter chart specific configuration
const generateScatterChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring scatter chart');
  const { showGrid = true } = options;
  
  baseConfig.options.scales = {
    x: {
      type: 'linear',
      position: 'bottom',
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    },
    y: {
      grid: {
        display: showGrid,
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      }
    }
  };

  console.log('Chart generator: Scatter chart configuration completed');
  return baseConfig;
};

// Pie chart specific configuration
const generatePieChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring pie/doughnut chart');
  
  // Remove scales for pie charts
  delete baseConfig.options.scales;
  
  // Enhanced pie chart options
  baseConfig.options.plugins.legend.position = 'right';
  baseConfig.options.plugins.tooltip.callbacks = {
    label: function(context) {
      const label = context.label || '';
      const value = context.parsed;
      const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
      const percentage = ((value / total) * 100).toFixed(1);
      return `${label}: ${value} (${percentage}%)`;
    }
  };

  console.log('Chart generator: Pie chart configuration completed');
  return baseConfig;
};

// Area chart specific configuration
const generateAreaChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring area chart');
  const lineConfig = generateLineChartConfig(baseConfig, options);
  
  // Make it filled
  if (lineConfig.data.datasets) {
    console.log('Chart generator: Applying area fill to datasets');
    lineConfig.data.datasets.forEach(dataset => {
      dataset.fill = true;
      dataset.backgroundColor = dataset.backgroundColor.replace('1)', '0.3)');
    });
  }

  console.log('Chart generator: Area chart configuration completed');
  return lineConfig;
};

// Radar chart specific configuration
const generateRadarChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring radar chart');
  baseConfig.options.scales = {
    r: {
      beginAtZero: true,
      grid: {
        color: options.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      pointLabels: {
        color: options.theme === 'dark' ? '#fff' : '#333'
      },
      ticks: {
        color: options.theme === 'dark' ? '#fff' : '#333',
        backdropColor: 'transparent'
      }
    }
  };

  console.log('Chart generator: Radar chart configuration completed');
  return baseConfig;
};

// Bubble chart specific configuration
const generateBubbleChartConfig = (baseConfig, options) => {
  console.log('Chart generator: Configuring bubble chart');
  const scatterConfig = generateScatterChartConfig(baseConfig, options);
  
  // Add radius property to datasets
  if (scatterConfig.data.datasets) {
    console.log('Chart generator: Adding bubble radii to datasets');
    scatterConfig.data.datasets.forEach(dataset => {
      if (!dataset.data.some(point => point.r !== undefined)) {
        dataset.data.forEach(point => {
          point.r = 5; // Default radius
        });
        console.log('Chart generator: Added default bubble radius (5px)');
      }
    });
  }

  console.log('Chart generator: Bubble chart configuration completed');
  return scatterConfig;
};

// Generate 3D chart configuration (for Three.js)
const generate3DChartConfig = (type, data, options = {}) => {
  console.log('Chart generator: Generating 3D chart configuration');
  console.log('Chart generator: 3D chart type:', type);
  
  const {
    width = 800,
    height = 600,
    theme = 'light',
    colors = ['#36A2EB', '#FF6384', '#FFCE56'],
    title = ''
  } = options;

  return {
    type: `3d-${type}`,
    data: data,
    options: {
      width,
      height,
      title,
      theme,
      colors,
      camera: {
        position: { x: 0, y: 0, z: 10 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      lighting: {
        ambient: 0.4,
        directional: 0.6
      },
      animation: {
        enabled: true,
        duration: 1000
      }
    }
  };
};

// Export chart as image
const exportChartAsImage = async (chartConfig, format = 'png', outputPath) => {
  console.log('Chart generator: Starting chart export');
  console.log('Chart generator: Export format:', format);
  console.log('Chart generator: Output path:', outputPath);
  
  try {
    // This would typically use a headless browser or canvas library
    // For now, we'll return the configuration and handle export on the frontend
    
    console.log('Chart generator: Export configuration prepared');
    return {
      success: true,
      config: chartConfig,
      format,
      outputPath
    };
  } catch (error) {
    console.error('Chart generator: Export failed:', error);
    throw error;
  }
};

// Get color palette for themes
const getColorPalette = (theme, count = 10) => {
  console.log('Chart generator: Getting color palette');
  console.log('Chart generator: Theme:', theme);
  console.log('Chart generator: Color count:', count);
  
  const palettes = {
    light: [
      '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384'
    ],
    dark: [
      '#5DADE2', '#F1948A', '#F7DC6F', '#76D7C4',
      '#BB8FCE', '#F8C471', '#85C1E9', '#D5DBDB',
      '#76D7C4', '#F1948A'
    ],
    colorful: [
      '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
      '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
      '#E91E63', '#00BCD4'
    ]
  };

  const palette = palettes[theme] || palettes.light;
  const selectedPalette = palette.slice(0, count);
  
  console.log('Chart generator: Selected palette colors:', selectedPalette);
  return selectedPalette;
};

// TODO: Add support for more chart types (gauge, heatmap, etc.)
// TODO: Implement chart animation presets
// TODO: Add chart template system
// TODO: Implement chart sharing and embedding
// TODO: Add chart export to multiple formats (SVG, PDF, etc.)
// TODO: Implement chart performance optimization
// TODO: Add chart data validation
// TODO: Implement chart accessibility features
// TODO: Add chart theming system
// TODO: Implement chart responsive behavior
// TODO: Add chart interaction features
// TODO: Implement chart real-time updates

// Utility functions
const validateChartData = (data, chartType) => {
  console.log('Chart generator: Validating chart data for type:', chartType);
  
  if (!data || !data.datasets) {
    console.log('Chart generator: Invalid data - missing datasets');
    return false;
  }
  
  if (!data.labels && chartType !== 'scatter' && chartType !== 'bubble') {
    console.log('Chart generator: Invalid data - missing labels');
    return false;
  }
  
  data.datasets.forEach((dataset, index) => {
    if (!dataset.data || !Array.isArray(dataset.data)) {
      console.log(`Chart generator: Dataset ${index} has invalid data`);
      return false;
    }
  });
  
  console.log('Chart generator: Chart data validation passed');
  return true;
};

const optimizeChartConfig = (config, dataSize) => {
  console.log('Chart generator: Optimizing chart configuration');
  console.log('Chart generator: Data size:', dataSize);
  
  // Reduce animation duration for large datasets
  if (dataSize > 1000) {
    console.log('Chart generator: Reducing animation duration for large dataset');
    config.options.animation.duration = 0;
  }
  
  // Disable legend for too many datasets
  if (config.data.datasets.length > 10) {
    console.log('Chart generator: Disabling legend for too many datasets');
    config.options.plugins.legend.display = false;
  }
  
  console.log('Chart generator: Configuration optimization completed');
  return config;
};

// Notes:
// - Consider implementing chart caching for performance
// - Add chart accessibility features (ARIA labels, screen reader support)
// - Implement chart export with server-side rendering
// - Add chart sharing and collaboration features
// - Consider implementing chart templates and presets
// - Add chart data validation and sanitization
// - Implement chart performance monitoring
// - Consider chart SEO optimization
// - Add chart watermarking for exports
// - Implement chart data encryption for sensitive data

module.exports = {
  generateChartConfig,
  generate3DChartConfig,
  exportChartAsImage,
  getColorPalette,
  validateChartData,
  optimizeChartConfig
};