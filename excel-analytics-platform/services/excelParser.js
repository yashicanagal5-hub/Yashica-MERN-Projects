const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');

// Debug logging for Excel parser service
console.log('Excel parser service loaded');

// Parse Excel file and extract data
const parseExcelFile = async (filePath) => {
  console.log('Excel parser: Starting file parsing');
  console.log('Excel parser: File path:', filePath);
  
  try {
    console.log('Excel parser: Reading workbook...');
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const sheets = {};
    
    let totalRows = 0;
    let totalColumns = 0;
    const allColumnHeaders = new Set();
    
    console.log('Excel parser: Sheet names found:', sheetNames);
    console.log('Excel parser: Number of sheets:', sheetNames.length);
    
    // Process each sheet
    for (const sheetName of sheetNames) {
      console.log(`Excel parser: Processing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0] || [];
        const data = jsonData.slice(1);
        
        console.log(`Excel parser: Sheet ${sheetName} - Headers:`, headers.length);
        console.log(`Excel parser: Sheet ${sheetName} - Data rows:`, data.length);
        
        // Add headers to the set
        headers.forEach(header => {
          if (header && header.toString().trim()) {
            allColumnHeaders.add(header.toString().trim());
            console.log(`Excel parser: Added header: ${header}`);
          }
        });
        
        // Process data and detect types
        console.log(`Excel parser: Processing data and detecting types...`);
        const processedData = data.map((row, rowIndex) => {
          const rowObject = {};
          headers.forEach((header, index) => {
            if (header) {
              const cellValue = row[index] !== undefined ? row[index] : null;
              rowObject[header] = cellValue;
              console.log(`Excel parser: Row ${rowIndex + 1}, Column ${header}:`, cellValue);
            }
          });
          return rowObject;
        });
        
        // Detect data types for each column
        console.log(`Excel parser: Detecting data types for ${headers.length} columns...`);
        const dataTypes = detectDataTypes(processedData, headers);
        console.log(`Excel parser: Data types detected:`, dataTypes);
        
        sheets[sheetName] = {
          headers: headers.filter(h => h && h.toString().trim()),
          data: processedData,
          rowCount: data.length,
          columnCount: headers.length,
          dataTypes: dataTypes
        };
        
        totalRows += data.length;
        totalColumns = Math.max(totalColumns, headers.length);
        
        console.log(`Excel parser: Sheet ${sheetName} processed successfully`);
      } else {
        console.log(`Excel parser: Sheet ${sheetName} is empty, skipping`);
      }
    }
    
    const result = {
      sheets,
      metadata: {
        sheetNames,
        totalRows,
        totalColumns,
        columnHeaders: Array.from(allColumnHeaders),
        hasData: totalRows > 0
      }
    };
    
    console.log('Excel parser: File parsing completed successfully');
    console.log('Excel parser: Summary:', {
      totalSheets: sheetNames.length,
      totalRows,
      totalColumns,
      columnHeaders: allColumnHeaders.size
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    console.log('Excel parser: Parsing failed for file:', filePath);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Detect data types for columns
const detectDataTypes = (data, headers) => {
  console.log('Excel parser: Starting data type detection');
  console.log('Excel parser: Number of data rows:', data.length);
  console.log('Excel parser: Number of headers:', headers.length);
  
  const dataTypes = {};
  
  headers.forEach(header => {
    if (!header) {
      console.log('Excel parser: Skipping empty header');
      return;
    }
    
    console.log(`Excel parser: Detecting type for column: ${header}`);
    
    const values = data
      .map(row => row[header])
      .filter(val => val !== null && val !== undefined && val !== '');
    
    console.log(`Excel parser: Column ${header} - Non-empty values:`, values.length);
    
    if (values.length === 0) {
      console.log(`Excel parser: Column ${header} - No data, marking as 'empty'`);
      dataTypes[header] = 'empty';
      return;
    }
    
    // Check for different data types
    const numericValues = values.filter(val => !isNaN(val) && !isNaN(parseFloat(val)));
    const dateValues = values.filter(val => isValidDate(val));
    const booleanValues = values.filter(val => 
      typeof val === 'boolean' || 
      (typeof val === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(val.toLowerCase()))
    );
    
    console.log(`Excel parser: Column ${header} - Numeric: ${numericValues.length}, Date: ${dateValues.length}, Boolean: ${booleanValues.length}`);
    
    // Determine the predominant type
    const total = values.length;
    
    if (numericValues.length / total >= 0.8) {
      // Check if it's integer or float
      const integerValues = numericValues.filter(val => Number.isInteger(parseFloat(val)));
      const isInteger = integerValues.length / numericValues.length >= 0.9;
      dataTypes[header] = isInteger ? 'integer' : 'float';
      console.log(`Excel parser: Column ${header} - Detected as ${dataTypes[header]}`);
    } else if (dateValues.length / total >= 0.8) {
      dataTypes[header] = 'date';
      console.log(`Excel parser: Column ${header} - Detected as date`);
    } else if (booleanValues.length / total >= 0.8) {
      dataTypes[header] = 'boolean';
      console.log(`Excel parser: Column ${header} - Detected as boolean`);
    } else {
      dataTypes[header] = 'string';
      console.log(`Excel parser: Column ${header} - Detected as string (default)`);
    }
  });
  
  console.log('Excel parser: Data type detection completed');
  console.log('Excel parser: Final data types:', dataTypes);
  return dataTypes;
};

// Check if a value is a valid date
const isValidDate = (value) => {
  if (!value) {
    console.log('Excel parser: Invalid date - null/undefined value');
    return false;
  }
  
  const date = new Date(value);
  const isValid = date instanceof Date && !isNaN(date.getTime());
  console.log(`Excel parser: Date validation for '${value}':`, isValid);
  return isValid;
};

// Get sample data from a sheet
const getSampleData = (sheetData, sampleSize = 10) => {
  console.log('Excel parser: Getting sample data');
  console.log('Excel parser: Sample size requested:', sampleSize);
  
  if (!sheetData || !sheetData.data) {
    console.log('Excel parser: Invalid sheet data provided');
    return [];
  }
  
  const sample = sheetData.data.slice(0, sampleSize);
  console.log('Excel parser: Sample data retrieved:', sample.length, 'rows');
  return sample;
};

// Get column statistics
const getColumnStatistics = (data, columnName) => {
  console.log('Excel parser: Calculating statistics for column:', columnName);
  console.log('Excel parser: Total data rows:', data.length);
  
  const values = data
    .map(row => row[columnName])
    .filter(val => val !== null && val !== undefined && val !== '')
    .map(val => parseFloat(val))
    .filter(val => !isNaN(val));
  
  console.log('Excel parser: Numeric values found:', values.length);
  
  if (values.length === 0) {
    console.log('Excel parser: No numeric values found, returning empty statistics');
    return {
      count: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      mode: null,
      standardDeviation: null
    };
  }
  
  values.sort((a, b) => a - b);
  console.log('Excel parser: Values sorted for median calculation');
  
  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  
  console.log('Excel parser: Basic statistics calculated:', { count, min, max, mean });
  
  // Calculate median
  const median = count % 2 === 0
    ? (values[count / 2 - 1] + values[count / 2]) / 2
    : values[Math.floor(count / 2)];
  
  console.log('Excel parser: Median calculated:', median);
  
  // Calculate mode
  const frequency = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  
  const maxFrequency = Math.max(...Object.values(frequency));
  const modes = Object.keys(frequency)
    .filter(key => frequency[key] === maxFrequency)
    .map(key => parseFloat(key));
  
  const mode = modes.length === 1 ? modes[0] : modes;
  console.log('Excel parser: Mode calculated:', mode);
  
  // Calculate standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);
  console.log('Excel parser: Standard deviation calculated:', standardDeviation);
  
  const statistics = {
    count,
    min,
    max,
    mean: parseFloat(mean.toFixed(2)),
    median,
    mode,
    standardDeviation: parseFloat(standardDeviation.toFixed(2)),
    sum: parseFloat(sum.toFixed(2))
  };
  
  console.log('Excel parser: Statistics calculation completed');
  console.log('Excel parser: Final statistics:', statistics);
  
  return statistics;
};

// Process data for chart generation
const processDataForChart = (data, xColumn, yColumn, chartType, options = {}) => {
  console.log('Excel parser: Starting data processing for chart');
  console.log('Excel parser: Chart type:', chartType);
  console.log('Excel parser: X column:', xColumn);
  console.log('Excel parser: Y column:', yColumn);
  console.log('Excel parser: Options:', options);
  
  try {
    const { groupBy, aggregation = 'sum', filters = {} } = options;
    
    console.log('Excel parser: Applying filters...');
    console.log('Excel parser: Filters:', filters);
    
    // Apply filters
    let filteredData = data.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const rowValue = row[key];
        
        if (filterValue === null || filterValue === undefined) return true;
        
        if (Array.isArray(filterValue)) {
          const match = filterValue.includes(rowValue);
          console.log(`Excel parser: Filter ${key}: ${rowValue} in [${filterValue.join(', ')}] = ${match}`);
          return match;
        }
        
        const match = rowValue === filterValue;
        console.log(`Excel parser: Filter ${key}: ${rowValue} = ${filterValue} = ${match}`);
        return match;
      });
    });
    
    console.log('Excel parser: Data after filtering:', filteredData.length, 'rows');
    
    // Group data if needed
    if (groupBy && groupBy !== xColumn) {
      console.log('Excel parser: Grouping data by:', groupBy);
      const grouped = {};
      
      filteredData.forEach(row => {
        const groupValue = row[groupBy];
        if (!grouped[groupValue]) {
          grouped[groupValue] = [];
        }
        grouped[groupValue].push(row);
      });
      
      console.log('Excel parser: Groups found:', Object.keys(grouped).length);
      
      // Aggregate grouped data
      filteredData = Object.keys(grouped).map(groupValue => {
        const groupData = grouped[groupValue];
        const aggregatedRow = { [groupBy]: groupValue };
        
        console.log(`Excel parser: Aggregating group ${groupValue} with ${groupData.length} rows`);
        
        // Aggregate numeric columns
        const numericColumns = [xColumn, yColumn].filter(col => 
          groupData.some(row => !isNaN(parseFloat(row[col])))
        );
        
        console.log('Excel parser: Numeric columns for aggregation:', numericColumns);
        
        numericColumns.forEach(col => {
          const values = groupData
            .map(row => parseFloat(row[col]))
            .filter(val => !isNaN(val));
          
          console.log(`Excel parser: Column ${col} values for aggregation:`, values);
          
          if (values.length > 0) {
            let aggregatedValue;
            switch (aggregation) {
              case 'sum':
                aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'average':
                aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'count':
                aggregatedValue = values.length;
                break;
              case 'min':
                aggregatedValue = Math.min(...values);
                break;
              case 'max':
                aggregatedValue = Math.max(...values);
                break;
              case 'median':
                values.sort((a, b) => a - b);
                aggregatedValue = values.length % 2 === 0
                  ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
                  : values[Math.floor(values.length / 2)];
                break;
              default:
                aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            }
            
            aggregatedRow[col] = aggregatedValue;
            console.log(`Excel parser: Column ${col} aggregated as ${aggregation}:`, aggregatedValue);
          }
        });
        
        return aggregatedRow;
      });
      
      console.log('Excel parser: Data after grouping:', filteredData.length, 'rows');
    }
    
    // Prepare chart data based on chart type
    console.log('Excel parser: Preparing chart data for type:', chartType);
    let chartData;
    
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        chartData = preparePieChartData(filteredData, xColumn, yColumn);
        break;
      
      case 'scatter':
      case 'bubble':
        chartData = prepareScatterChartData(filteredData, xColumn, yColumn);
        break;
      
      default:
        chartData = prepareLineBarChartData(filteredData, xColumn, yColumn);
    }
    
    console.log('Excel parser: Chart data prepared successfully');
    console.log('Excel parser: Chart data structure:', {
      labels: chartData.labels?.length,
      datasets: chartData.datasets?.length
    });
    
    return chartData;
  } catch (error) {
    console.error('Error processing data for chart:', error);
    console.log('Excel parser: Chart data processing failed');
    throw new Error(`Failed to process data: ${error.message}`);
  }
};

// Prepare data for pie/doughnut charts
const preparePieChartData = (data, labelColumn, valueColumn) => {
  console.log('Excel parser: Preparing pie chart data');
  console.log('Excel parser: Label column:', labelColumn);
  console.log('Excel parser: Value column:', valueColumn);
  
  const aggregated = {};
  
  data.forEach(row => {
    const label = row[labelColumn];
    const value = parseFloat(row[valueColumn]);
    
    if (!isNaN(value)) {
      aggregated[label] = (aggregated[label] || 0) + value;
      console.log(`Excel parser: Added to pie chart: ${label} = ${aggregated[label]}`);
    }
  });
  
  const result = {
    labels: Object.keys(aggregated),
    datasets: [{
      data: Object.values(aggregated),
      backgroundColor: generateColors(Object.keys(aggregated).length)
    }]
  };
  
  console.log('Excel parser: Pie chart data prepared:', {
    labels: result.labels.length,
    values: result.datasets[0].data.length
  });
  
  return result;
};

// Prepare data for scatter/bubble charts
const prepareScatterChartData = (data, xColumn, yColumn) => {
  console.log('Excel parser: Preparing scatter chart data');
  console.log('Excel parser: X column:', xColumn);
  console.log('Excel parser: Y column:', yColumn);
  
  const points = data
    .map(row => {
      const x = parseFloat(row[xColumn]);
      const y = parseFloat(row[yColumn]);
      return { x, y };
    })
    .filter(point => !isNaN(point.x) && !isNaN(point.y));
  
  console.log('Excel parser: Valid points for scatter chart:', points.length);
  
  const result = {
    datasets: [{
      label: `${yColumn} vs ${xColumn}`,
      data: points,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)'
    }]
  };
  
  console.log('Excel parser: Scatter chart data prepared');
  return result;
};

// Prepare data for line/bar charts
const prepareLineBarChartData = (data, xColumn, yColumn) => {
  console.log('Excel parser: Preparing line/bar chart data');
  console.log('Excel parser: X column:', xColumn);
  console.log('Excel parser: Y column:', yColumn);
  
  const labels = [];
  const values = [];
  
  data.forEach(row => {
    const label = row[xColumn];
    const value = parseFloat(row[yColumn]);
    
    if (!isNaN(value)) {
      labels.push(label);
      values.push(value);
      console.log(`Excel parser: Added to chart: ${label} = ${value}`);
    }
  });
  
  const result = {
    labels,
    datasets: [{
      label: yColumn,
      data: values,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false
    }]
  };
  
  console.log('Excel parser: Line/bar chart data prepared:', {
    labels: labels.length,
    values: values.length
  });
  
  return result;
};

// Generate color palette
const generateColors = (count) => {
  console.log('Excel parser: Generating color palette for', count, 'items');
  
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  console.log('Excel parser: Generated colors:', result);
  return result;
};

// TODO: Add support for multiple worksheet processing
// TODO: Implement data validation and cleaning
// TODO: Add advanced filtering capabilities
// TODO: Implement data transformation functions
// TODO: Add error handling for corrupted files
// TODO: Implement progress tracking for large files
// TODO: Add support for different file formats (CSV, JSON)
// TODO: Implement data aggregation functions
// TODO: Add caching for parsed data
// TODO: Implement data export functionality
// TODO: Add data preview generation
// TODO: Implement memory optimization for large datasets

// Notes:
// - Consider adding file format detection and validation
// - Implement streaming parser for very large files
// - Add data compression for storage optimization
// - Implement data encryption for sensitive information
// - Add data backup and recovery mechanisms
// - Consider implementing data versioning
// - Add performance monitoring and optimization
// - Implement data quality assessment
// - Add support for encrypted/password-protected files
// - Consider implementing data anonymization

module.exports = {
  parseExcelFile,
  detectDataTypes,
  getSampleData,
  getColumnStatistics,
  processDataForChart,
  generateColors
};