// Data processing utilities with enhanced statistical analysis
const moment = require('moment');

// TODO: Add input validation and sanitization for all functions
// TODO: Implement streaming processing for large datasets
// TODO: Add parallel processing capabilities for heavy computations
// TODO: Implement caching for repeated statistical calculations

// Statistical functions with comprehensive analysis
const calculateStatistics = (data, column) => {
  console.log(`[DataProcessing] Calculating statistics for column: ${column}`);
  console.log(`[DataProcessing] Input data size: ${data.length} rows`);
  
  const values = data
    .map(row => parseFloat(row[column]))
    .filter(val => !isNaN(val) && val !== null && val !== undefined);
  
  console.log(`[DataProcessing] Valid numeric values found: ${values.length}`);
  
  if (values.length === 0) {
    console.log(`[DataProcessing] No valid numeric values for column: ${column}`);
    return {
      count: 0,
      sum: 0,
      mean: null,
      median: null,
      mode: null,
      min: null,
      max: null,
      range: null,
      variance: null,
      standardDeviation: null,
      quartiles: { q1: null, q2: null, q3: null },
      outliers: []
    };
  }

  console.log(`[DataProcessing] Processing ${values.length} numeric values`);
  
  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  
  console.log(`[DataProcessing] Basic stats - Count: ${count}, Sum: ${sum}, Mean: ${mean}`);
  
  // Median calculation with edge case handling
  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];
  
  console.log(`[DataProcessing] Median calculated: ${median}`);
  
  // Mode calculation with frequency analysis
  const frequency = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  
  const maxFrequency = Math.max(...Object.values(frequency));
  const modes = Object.keys(frequency)
    .filter(key => frequency[key] === maxFrequency)
    .map(key => parseFloat(key));
  
  // If all values are unique, there's no mode
  const mode = modes.length === values.length ? null : modes;
  
  console.log(`[DataProcessing] Mode calculation - Max frequency: ${maxFrequency}, Modes: ${modes}`);
  
  // Min, Max, Range calculations
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  console.log(`[DataProcessing] Range analysis - Min: ${min}, Max: ${max}, Range: ${range}`);
  
  // Variance and Standard Deviation calculations
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);
  
  console.log(`[DataProcessing] Variance and StdDev - Variance: ${variance}, StdDev: ${standardDeviation}`);
  
  // Quartiles calculation with IQR method
  const q1Index = Math.floor(count * 0.25);
  const q3Index = Math.floor(count * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  console.log(`[DataProcessing] Quartiles - Q1: ${q1}, Q3: ${q3}, IQR: ${iqr}`);
  
  // Outlier detection using IQR method (standard 1.5 * IQR)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = values.filter(val => val < lowerBound || val > upperBound);
  
  console.log(`[DataProcessing] Outlier detection - Lower bound: ${lowerBound}, Upper bound: ${upperBound}`);
  console.log(`[DataProcessing] Outliers found: ${outliers.length} values`);
  
  const result = {
    count,
    sum: parseFloat(sum.toFixed(2)),
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    mode,
    min,
    max,
    range: parseFloat(range.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    standardDeviation: parseFloat(standardDeviation.toFixed(2)),
    quartiles: {
      q1: parseFloat(q1.toFixed(2)),
      q2: parseFloat(median.toFixed(2)), // Q2 is the median
      q3: parseFloat(q3.toFixed(2))
    },
    outliers: outliers.map(val => parseFloat(val.toFixed(2)))
  };
  
  console.log(`[DataProcessing] Statistics calculation completed for column: ${column}`);
  return result;
};

// Correlation analysis with statistical significance testing
const calculateCorrelation = (data, column1, column2) => {
  console.log(`[DataProcessing] Calculating correlation between: ${column1} and ${column2}`);
  console.log(`[DataProcessing] Input data size: ${data.length} rows`);
  
  const pairs = data
    .map(row => ({
      x: parseFloat(row[column1]),
      y: parseFloat(row[column2])
    }))
    .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));
  
  console.log(`[DataProcessing] Valid pairs found: ${pairs.length}`);
  
  if (pairs.length < 2) {
    console.log(`[DataProcessing] Insufficient data for correlation analysis`);
    return {
      correlation: null,
      strength: 'insufficient data',
      significance: null
    };
  }
  
  const n = pairs.length;
  console.log(`[DataProcessing] Sample size: ${n} pairs`);
  
  const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0);
  const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0);
  const sumXY = pairs.reduce((sum, pair) => sum + (pair.x * pair.y), 0);
  const sumX2 = pairs.reduce((sum, pair) => sum + (pair.x * pair.x), 0);
  const sumY2 = pairs.reduce((sum, pair) => sum + (pair.y * pair.y), 0);
  
  // Calculate correlation coefficient using Pearson correlation formula
  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
  
  console.log(`[DataProcessing] Correlation calculation - Numerator: ${numerator}, Denominator: ${denominator}`);
  
  if (denominator === 0) {
    console.log(`[DataProcessing] Zero variance detected - no correlation can be calculated`);
    return {
      correlation: 0,
      strength: 'no correlation',
      significance: 'not significant'
    };
  }
  
  const correlation = numerator / denominator;
  console.log(`[DataProcessing] Raw correlation coefficient: ${correlation}`);
  
  // Determine correlation strength based on standard thresholds
  const absCorr = Math.abs(correlation);
  let strength;
  if (absCorr >= 0.8) {
    strength = 'very strong';
  } else if (absCorr >= 0.6) {
    strength = 'strong';
  } else if (absCorr >= 0.4) {
    strength = 'moderate';
  } else if (absCorr >= 0.2) {
    strength = 'weak';
  } else {
    strength = 'very weak';
  }
  
  console.log(`[DataProcessing] Correlation strength: ${strength}`);
  
  // Statistical significance testing (approximate p-value calculation)
  // Using critical value approach for |r| > critical value with p < 0.05
  const criticalValue = 1.96 / Math.sqrt(n - 3); // Fisher's z-transform approximation
  const significance = Math.abs(correlation) > criticalValue ? 'significant' : 'not significant';
  
  console.log(`[DataProcessing] Statistical significance - Critical value: ${criticalValue}, Significance: ${significance}`);
  
  return {
    correlation: parseFloat(correlation.toFixed(4)),
    strength,
    significance,
    sampleSize: n
  };
};

// Data cleaning functions with comprehensive options
const cleanData = (data, options = {}) => {
  console.log(`[DataProcessing] Starting data cleaning process`);
  console.log(`[DataProcessing] Input data size: ${data.length} rows`);
  console.log(`[DataProcessing] Cleaning options:`, options);
  
  const {
    removeNulls = true,
    removeEmptyStrings = true,
    trimStrings = true,
    removeDuplicates = false,
    convertTypes = true
  } = options;
  
  let cleanedData = [...data];
  let cleaningStats = {
    originalRows: cleanedData.length,
    rowsAfterNullRemoval: 0,
    rowsAfterEmptyRemoval: 0,
    duplicatesRemoved: 0,
    totalTransformations: 0
  };
  
  // Remove null/undefined values
  if (removeNulls) {
    const originalLength = cleanedData.length;
    cleanedData = cleanedData.filter(row => {
      return Object.values(row).some(val => val !== null && val !== undefined);
    });
    cleaningStats.rowsAfterNullRemoval = cleanedData.length;
    console.log(`[DataProcessing] Removed ${originalLength - cleanedData.length} rows with null values`);
  }
  
  console.log(`[DataProcessing] Data after null removal: ${cleanedData.length} rows`);
  
  // Process each row for cleaning
  cleanedData = cleanedData.map(row => {
    const cleanedRow = { ...row };
    let rowTransformations = 0;
    
    Object.keys(cleanedRow).forEach(key => {
      let value = cleanedRow[key];
      
      // Remove empty strings
      if (removeEmptyStrings && value === '') {
        cleanedRow[key] = null;
        rowTransformations++;
        return;
      }
      
      // Trim strings
      if (trimStrings && typeof value === 'string') {
        const trimmedValue = value.trim();
        if (trimmedValue !== value) {
          rowTransformations++;
          value = trimmedValue;
        }
      }
      
      // Convert types based on content
      if (convertTypes && typeof value === 'string') {
        // Try to convert to number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanedRow[key] = numValue;
          rowTransformations++;
          return;
        }
        
        // Try to convert to boolean
        const lowerValue = value.toLowerCase();
        if (['true', 'false', 'yes', 'no'].includes(lowerValue)) {
          cleanedRow[key] = ['true', 'yes'].includes(lowerValue);
          rowTransformations++;
          return;
        }
        
        // Try to convert to date
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
          cleanedRow[key] = dateValue;
          rowTransformations++;
          return;
        }
      }
      
      cleanedRow[key] = value;
    });
    
    cleaningStats.totalTransformations += rowTransformations;
    return cleanedRow;
  });
  
  cleaningStats.rowsAfterEmptyRemoval = cleanedData.length;
  
  // Remove duplicates
  if (removeDuplicates) {
    const originalLength = cleanedData.length;
    const seen = new Set();
    cleanedData = cleanedData.filter(row => {
      const rowString = JSON.stringify(row);
      if (seen.has(rowString)) {
        return false;
      }
      seen.add(rowString);
      return true;
    });
    cleaningStats.duplicatesRemoved = originalLength - cleanedData.length;
    console.log(`[DataProcessing] Removed ${cleaningStats.duplicatesRemoved} duplicate rows`);
  }
  
  console.log(`[DataProcessing] Cleaning completed - Final data: ${cleanedData.length} rows`);
  console.log(`[DataProcessing] Total transformations applied: ${cleaningStats.totalTransformations}`);
  console.log(`[DataProcessing] Cleaning statistics:`, cleaningStats);
  
  return cleanedData;
};

// Data transformation functions with advanced options
const transformData = (data, transformations) => {
  console.log(`[DataProcessing] Starting data transformation process`);
  console.log(`[DataProcessing] Input data size: ${data.length} rows`);
  console.log(`[DataProcessing] Transformations to apply:`, transformations.length);
  
  let transformedData = [...data];
  let transformationLog = [];
  
  transformations.forEach((transformation, index) => {
    const { type, column, options = {} } = transformation;
    console.log(`[DataProcessing] Applying transformation ${index + 1}: ${type} on column ${column}`);
    
    try {
      switch (type) {
        case 'normalize':
          transformedData = normalizeColumn(transformedData, column, options);
          transformationLog.push({ type, column, status: 'success', rowsProcessed: transformedData.length });
          break;
        case 'standardize':
          transformedData = standardizeColumn(transformedData, column, options);
          transformationLog.push({ type, column, status: 'success', rowsProcessed: transformedData.length });
          break;
        case 'log':
          transformedData = logTransform(transformedData, column, options);
          transformationLog.push({ type, column, status: 'success', rowsProcessed: transformedData.length });
          break;
        case 'binning':
          transformedData = binColumn(transformedData, column, options);
          transformationLog.push({ type, column, status: 'success', rowsProcessed: transformedData.length });
          break;
        case 'encoding':
          transformedData = encodeColumn(transformedData, column, options);
          transformationLog.push({ type, column, status: 'success', rowsProcessed: transformedData.length });
          break;
        default:
          console.warn(`[DataProcessing] Unknown transformation type: ${type}`);
          transformationLog.push({ type, column, status: 'skipped', reason: 'Unknown type' });
      }
    } catch (error) {
      console.error(`[DataProcessing] Error in transformation ${type}:`, error.message);
      transformationLog.push({ type, column, status: 'failed', error: error.message });
    }
  });
  
  console.log(`[DataProcessing] Transformation completed`);
  console.log(`[DataProcessing] Transformation log:`, transformationLog);
  
  return transformedData;
};

// Normalize column values to 0-1 range with error handling
const normalizeColumn = (data, column, options = {}) => {
  console.log(`[DataProcessing] Normalizing column: ${column}`);
  
  const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
  
  if (values.length === 0) {
    console.warn(`[DataProcessing] No valid numeric values found for normalization: ${column}`);
    return data;
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  console.log(`[DataProcessing] Normalization range - Min: ${min}, Max: ${max}, Range: ${range}`);
  
  if (range === 0) {
    console.warn(`[DataProcessing] Zero range detected for column: ${column} - cannot normalize`);
    return data;
  }
  
  return data.map(row => {
    const value = parseFloat(row[column]);
    if (!isNaN(value)) {
      row[`${column}_normalized`] = (value - min) / range;
    }
    return row;
  });
};

// Standardize column values using z-score normalization
const standardizeColumn = (data, column, options = {}) => {
  console.log(`[DataProcessing] Standardizing column: ${column}`);
  
  const stats = calculateStatistics(data, column);
  
  if (stats.standardDeviation === 0 || stats.standardDeviation === null) {
    console.warn(`[DataProcessing] Cannot standardize column ${column} - zero or null standard deviation`);
    return data;
  }
  
  console.log(`[DataProcessing] Standardization using mean: ${stats.mean}, std: ${stats.standardDeviation}`);
  
  return data.map(row => {
    const value = parseFloat(row[column]);
    if (!isNaN(value)) {
      row[`${column}_standardized`] = (value - stats.mean) / stats.standardDeviation;
    }
    return row;
  });
};

// Log transformation with base selection
const logTransform = (data, column, options = {}) => {
  console.log(`[DataProcessing] Applying log transform to column: ${column}`);
  
  const { base = Math.E, addConstant = 1 } = options;
  
  let transformedData = data;
  let nonPositiveCount = 0;
  
  transformedData = data.map(row => {
    const value = parseFloat(row[column]);
    if (!isNaN(value)) {
      if (value > 0) {
        row[`${column}_log`] = Math.log(value + addConstant) / Math.log(base);
      } else {
        console.warn(`[DataProcessing] Non-positive value detected in log transform: ${value}`);
        nonPositiveCount++;
      }
    }
    return row;
  });
  
  console.log(`[DataProcessing] Log transform completed - ${nonPositiveCount} non-positive values skipped`);
  return transformedData;
};

// Binning/Bucketing with multiple strategies
const binColumn = (data, column, options = {}) => {
  console.log(`[DataProcessing] Creating bins for column: ${column}`);
  
  const { bins = 5, method = 'equal_width' } = options;
  
  const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
  
  if (values.length === 0) {
    console.warn(`[DataProcessing] No valid numeric values found for binning: ${column}`);
    return data;
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  console.log(`[DataProcessing] Binning range - Min: ${min}, Max: ${max}, Method: ${method}`);
  
  let binEdges = [];
  
  if (method === 'equal_width') {
    const binWidth = (max - min) / bins;
    for (let i = 0; i <= bins; i++) {
      binEdges.push(min + (i * binWidth));
    }
    console.log(`[DataProcessing] Equal width binning - bin width: ${binWidth}`);
  } else if (method === 'quantile') {
    const sorted = [...values].sort((a, b) => a - b);
    for (let i = 0; i <= bins; i++) {
      const index = Math.floor((i / bins) * (sorted.length - 1));
      binEdges.push(sorted[index]);
    }
    console.log(`[DataProcessing] Quantile binning - bin edges:`, binEdges);
  }
  
  return data.map(row => {
    const value = parseFloat(row[column]);
    if (!isNaN(value)) {
      for (let i = 0; i < binEdges.length - 1; i++) {
        if (value >= binEdges[i] && value <= binEdges[i + 1]) {
          const binRange = `${binEdges[i].toFixed(2)}-${binEdges[i + 1].toFixed(2)}`;
          row[`${column}_bin`] = `Bin ${i + 1} (${binRange})`;
          break;
        }
      }
    }
    return row;
  });
};

// Categorical encoding with multiple methods
const encodeColumn = (data, column, options = {}) => {
  console.log(`[DataProcessing] Encoding categorical column: ${column}`);
  
  const { method = 'label' } = options;
  
  const uniqueValues = [...new Set(data.map(row => row[column]).filter(val => val !== null && val !== undefined))];
  
  console.log(`[DataProcessing] Unique values found: ${uniqueValues.length}`);
  console.log(`[DataProcessing] Unique values:`, uniqueValues);
  
  if (method === 'label') {
    const labelMap = {};
    uniqueValues.forEach((value, index) => {
      labelMap[value] = index;
    });
    
    console.log(`[DataProcessing] Label mapping created:`, labelMap);
    
    return data.map(row => {
      const value = row[column];
      if (value !== null && value !== undefined) {
        row[`${column}_encoded`] = labelMap[value];
      }
      return row;
    });
  } else if (method === 'onehot') {
    console.log(`[DataProcessing] Applying one-hot encoding with ${uniqueValues.length} categories`);
    
    return data.map(row => {
      const value = row[column];
      uniqueValues.forEach(uniqueValue => {
        const safeColumnName = uniqueValue.toString().replace(/[^a-zA-Z0-9]/g, '_');
        row[`${column}_${safeColumnName}`] = value === uniqueValue ? 1 : 0;
      });
      return row;
    });
  }
  
  console.log(`[DataProcessing] Unknown encoding method: ${method} - returning data unchanged`);
  return data;
};

// Generate insights from data with AI-powered recommendations
const generateInsights = (data, columns) => {
  console.log(`[DataProcessing] Generating insights from data`);
  console.log(`[DataProcessing] Data size: ${data.length} rows`);
  console.log(`[DataProcessing] Columns to analyze:`, columns);
  
  const insights = [];
  let insightCount = 0;
  
  // Statistical insights for numeric columns
  console.log(`[DataProcessing] Analyzing numeric columns for statistical insights`);
  
  const numericColumns = columns.filter(col => {
    const sample = data.slice(0, 100).map(row => parseFloat(row[col])).filter(val => !isNaN(val));
    return sample.length > 0;
  });
  
  console.log(`[DataProcessing] Identified numeric columns:`, numericColumns);
  
  numericColumns.forEach(column => {
    console.log(`[DataProcessing] Analyzing column: ${column}`);
    
    const stats = calculateStatistics(data, column);
    insightCount++;
    
    // Outlier detection with statistical significance
    if (stats.outliers.length > 0) {
      const outlierPercentage = (stats.outliers.length / stats.count) * 100;
      console.log(`[DataProcessing] Outliers detected: ${stats.outliers.length} (${outlierPercentage.toFixed(2)}%)`);
      
      insights.push({
        type: 'outlier',
        category: 'data_quality',
        message: `Column '${column}' has ${stats.outliers.length} outlier(s) representing ${outlierPercentage.toFixed(2)}% of data: ${stats.outliers.slice(0, 3).join(', ')}${stats.outliers.length > 3 ? '...' : ''}`,
        confidence: outlierPercentage > 10 ? 0.9 : 0.7,
        column,
        data: stats.outliers,
        recommendation: outlierPercentage > 5 ? 'Consider investigating outlier causes or applying transformation' : 'Outlier percentage is within acceptable range'
      });
    }
    
    // Skewness detection with interpretation
    const skewness = calculateSkewness(data, column);
    if (Math.abs(skewness) > 1) {
      console.log(`[DataProcessing] Skewness detected: ${skewness}`);
      
      insights.push({
        type: 'distribution',
        category: 'pattern',
        message: `Column '${column}' shows ${skewness > 0 ? 'positive' : 'negative'} skewness (${skewness.toFixed(2)}), indicating an asymmetric distribution`,
        confidence: 0.8,
        column,
        data: { 
          skewness,
          interpretation: skewness > 1 ? 'Highly right-skewed (long tail on right)' : 
                        skewness < -1 ? 'Highly left-skewed (long tail on left)' : 'Moderate skewness'
        },
        recommendation: Math.abs(skewness) > 2 ? 'Consider log transformation to normalize distribution' : 'Distribution is acceptable for most analyses'
      });
    }
    
    // Range and variability analysis
    if (stats.range !== null && stats.standardDeviation !== null) {
      const coefficientOfVariation = stats.standardDeviation / Math.abs(stats.mean || 1);
      
      insights.push({
        type: 'variability',
        category: 'distribution',
        message: `Column '${column}' has ${coefficientOfVariation > 1 ? 'high' : 'moderate'} variability (CV: ${coefficientOfVariation.toFixed(2)})`,
        confidence: 0.75,
        column,
        data: {
          range: stats.range,
          standardDeviation: stats.standardDeviation,
          coefficientOfVariation
        }
      });
    }
  });
  
  // Correlation insights with enhanced analysis
  console.log(`[DataProcessing] Analyzing correlations between numeric columns`);
  
  if (numericColumns.length >= 2) {
    console.log(`[DataProcessing] Checking correlations for ${numericColumns.length} numeric columns`);
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const correlation = calculateCorrelation(data, numericColumns[i], numericColumns[j]);
        
        if (Math.abs(correlation.correlation) > 0.7) {
          console.log(`[DataProcessing] Strong correlation found: ${numericColumns[i]} vs ${numericColumns[j]} = ${correlation.correlation}`);
          
          insights.push({
            type: 'correlation',
            category: 'relationship',
            message: `Strong ${correlation.correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.correlation}) found between '${numericColumns[i]}' and '${numericColumns[j]}'`,
            confidence: correlation.significance === 'significant' ? 0.9 : 0.7,
            columns: [numericColumns[i], numericColumns[j]],
            data: {
              ...correlation,
              recommendation: Math.abs(correlation.correlation) > 0.9 ? 
                'Consider multicollinearity issues in modeling' : 
                'Strong relationship detected - investigate potential causation'
            }
          });
        } else if (Math.abs(correlation.correlation) < 0.1 && correlation.sampleSize > 100) {
          console.log(`[DataProcessing] No correlation found: ${numericColumns[i]} vs ${numericColumns[j]}`);
          
          insights.push({
            type: 'independence',
            category: 'relationship',
            message: `No significant correlation (${correlation.correlation}) between '${numericColumns[i]}' and '${numericColumns[j]}'`,
            confidence: 0.6,
            columns: [numericColumns[i], numericColumns[j]],
            data: correlation
          });
        }
      }
    }
  }
  
  // Data quality insights
  console.log(`[DataProcessing] Analyzing data quality`);
  
  const totalCells = data.length * columns.length;
  const nullCounts = columns.map(col => {
    return data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
  });
  
  const missingPercentage = (nullCounts.reduce((a, b) => a + b, 0) / totalCells) * 100;
  
  if (missingPercentage > 10) {
    insights.push({
      type: 'data_quality',
      category: 'completeness',
      message: `High percentage of missing data detected: ${missingPercentage.toFixed(2)}% across all columns`,
      confidence: 0.9,
      data: {
        missingPercentage,
        totalCells,
        totalMissing: nullCounts.reduce((a, b) => a + b, 0)
      },
      recommendation: 'Consider data imputation or collection improvement strategies'
    });
  }
  
  console.log(`[DataProcessing] Insight generation completed - Generated ${insights.length} insights`);
  
  return insights;
};

// Calculate skewness with enhanced statistical analysis
const calculateSkewness = (data, column) => {
  console.log(`[DataProcessing] Calculating skewness for column: ${column}`);
  
  const stats = calculateStatistics(data, column);
  const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
  
  if (values.length < 3 || stats.standardDeviation === 0) {
    console.warn(`[DataProcessing] Cannot calculate skewness - insufficient data or zero variance`);
    return 0;
  }
  
  const n = values.length;
  const mean = stats.mean;
  const std = stats.standardDeviation;
  
  console.log(`[DataProcessing] Skewness calculation - Sample size: ${n}, Mean: ${mean}, Std: ${std}`);
  
  // Calculate sample skewness using the Fisher-Pearson coefficient
  const skewness = values.reduce((sum, val) => {
    return sum + Math.pow((val - mean) / std, 3);
  }, 0) / n;
  
  console.log(`[DataProcessing] Skewness result: ${skewness}`);
  
  return parseFloat(skewness.toFixed(4));
};

module.exports = {
  calculateStatistics,
  calculateCorrelation,
  cleanData,
  transformData,
  generateInsights,
  calculateSkewness
};