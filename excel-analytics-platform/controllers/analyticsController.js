const Analysis = require('../models/Analysis');
const Chart = require('../models/Chart');
const UploadedFile = require('../models/UploadedFile');
const { parseExcelFile, processDataForChart } = require('../services/excelParser');
const { generateChartConfig, generate3DChartConfig } = require('../services/chartGenerator');
const { calculateStatistics, calculateCorrelation, generateInsights } = require('../utils/dataProcessing');

console.log('📈 analyticsController: Loading analysis and chart controllers');

// Create new analysis
const createAnalysis = async (req, res) => {
  console.log('🆕 analyticsController: createAnalysis - User:', req.user._id);
  
  try {
    const {
      title,
      description,
      fileId,
      configuration
    } = req.body;
    
    console.log('📝 analyticsController: Analysis request - Title:', title, 'File:', fileId, 'Chart type:', configuration?.chartType);
    
    // Verify file exists and user has access
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id
    });
    
    if (!file) {
      console.log('❌ analyticsController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (!file.processed || file.status !== 'completed') {
      console.log('⚠️ analyticsController: File not processed or processing failed:', file.status);
      return res.status(400).json({ 
        message: 'File is not yet processed or processing failed' 
      });
    }
    
    // Create analysis record
    const analysis = new Analysis({
      title,
      description,
      fileId,
      userId: req.user._id,
      configuration,
      status: 'processing'
    });
    
    console.log('💾 analyticsController: Saving analysis record...');
    await analysis.save();
    
    // Process analysis asynchronously
    console.log('🔄 analyticsController: Starting async analysis processing...');
    processAnalysis(analysis._id)
      .catch(error => {
        console.error('❌ analyticsController: Error processing analysis:', analysis._id, error);
        Analysis.findByIdAndUpdate(analysis._id, {
          status: 'error',
          error: error.message
        }).catch(console.error);
      });
    
    console.log('✅ analyticsController: Analysis created successfully:', analysis._id);
    res.status(201).json({
      message: 'Analysis created and is being processed',
      analysis: {
        id: analysis._id,
        title: analysis.title,
        status: analysis.status,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('❌ analyticsController: Create analysis error:', error);
    res.status(500).json({ 
      message: 'Error creating analysis', 
      error: error.message 
    });
  }
};

// Process analysis asynchronously
const processAnalysis = async (analysisId) => {
  const startTime = Date.now();
  console.log(`⚙️ analyticsController: Processing analysis ${analysisId}...`);
  
  try {
    const analysis = await Analysis.findById(analysisId).populate('fileId');
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    const file = analysis.fileId;
    const config = analysis.configuration;
    
    console.log('📊 analyticsController: Analyzing file:', file.originalName, 'Chart type:', config.chartType);
    
    // Parse Excel file data
    const { sheets } = await parseExcelFile(file.path);
    const sheetData = sheets[config.selectedSheet];
    
    if (!sheetData) {
      throw new Error(`Sheet '${config.selectedSheet}' not found`);
    }
    
    console.log('📈 analyticsController: Processing data for chart...');
    // Process data for chart
    const chartData = processDataForChart(
      sheetData.data,
      config.xAxis.column,
      config.yAxis.column,
      config.chartType,
      {
        groupBy: config.groupBy,
        aggregation: config.aggregation,
        filters: config.filters
      }
    );
    
    // Calculate statistics
    console.log('🧮 analyticsController: Calculating statistics...');
    const xStats = calculateStatistics(sheetData.data, config.xAxis.column);
    const yStats = calculateStatistics(sheetData.data, config.yAxis.column);
    
    // Calculate correlation if both columns are numeric
    let correlation = null;
    if (xStats.count > 0 && yStats.count > 0) {
      console.log('🔗 analyticsController: Calculating correlation...');
      correlation = calculateCorrelation(
        sheetData.data,
        config.xAxis.column,
        config.yAxis.column
      );
    }
    
    // Generate insights
    console.log('💡 analyticsController: Generating insights...');
    const insights = generateInsights(sheetData.data, [config.xAxis.column, config.yAxis.column]);
    
    // Create chart configuration
    console.log('🎨 analyticsController: Generating chart configuration...');
    const chartConfig = config.chartType.startsWith('3d-')
      ? generate3DChartConfig(config.chartType.replace('3d-', ''), chartData, config.customizations)
      : generateChartConfig(config.chartType, chartData, config.customizations);
    
    // Create chart record
    console.log('💾 analyticsController: Saving chart record...');
    const chart = new Chart({
      name: analysis.title,
      description: analysis.description,
      analysisId: analysis._id,
      userId: analysis.userId,
      type: config.chartType,
      configuration: {
        ...config.customizations,
        width: 800,
        height: 600,
        responsive: true
      },
      data: chartData
    });
    
    await chart.save();
    
    // Update analysis with results
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ analyticsController: Processing completed in ${processingTime}ms`);
    
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      processingTime,
      results: {
        processedData: {
          chartData,
          chartConfig
        },
        statistics: {
          xAxis: xStats,
          yAxis: yStats,
          correlation
        },
        insights: insights.map(insight => ({
          type: insight.message,
          category: insight.category,
          confidence: insight.confidence
        }))
      }
    });
    
    console.log(`✅ analyticsController: Successfully processed analysis ${analysisId} in ${processingTime}ms`);
  } catch (error) {
    console.error(`❌ analyticsController: Error processing analysis ${analysisId}:`, error);
    throw error;
  }
};

// Get user's analyses
const getUserAnalyses = async (req, res) => {
  console.log('📋 analyticsController: getUserAnalyses - User:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      chartType,
      search
    } = req.query;
    
    const query = { userId: req.user._id };
    
    // Filter by status
    if (status) {
      query.status = status;
      console.log('🔍 analyticsController: Filtering by status:', status);
    }
    
    // Filter by chart type
    if (chartType) {
      query['configuration.chartType'] = chartType;
      console.log('📊 analyticsController: Filtering by chart type:', chartType);
    }
    
    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      console.log('🔍 analyticsController: Searching with term:', search);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('📋 analyticsController: Fetching analyses - Page:', page, 'Limit:', limit, 'Sort:', sortBy, sortOrder);
    
    const analyses = await Analysis.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('fileId', 'originalName size')
      .select('-results.processedData'); // Exclude large data for list view
    
    const total = await Analysis.countDocuments(query);
    
    console.log(`✅ analyticsController: Found ${analyses.length} analyses out of ${total} total`);
    
    res.json({
      analyses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ analyticsController: Get user analyses error:', error);
    res.status(500).json({ 
      message: 'Error fetching analyses', 
      error: error.message 
    });
  }
};

// Get specific analysis details
const getAnalysisDetails = async (req, res) => {
  console.log('📋 analyticsController: getAnalysisDetails - Analysis:', req.params.analysisId, 'User:', req.user._id);
  
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user._id
    })
    .populate('fileId', 'originalName size metadata')
    .populate('userId', 'name email');
    
    if (!analysis) {
      console.log('❌ analyticsController: Analysis not found or access denied:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    // Get associated charts
    console.log('📊 analyticsController: Fetching associated charts...');
    const charts = await Chart.find({ analysisId: analysis._id });
    
    console.log('✅ analyticsController: Analysis details retrieved successfully');
    
    res.json({
      analysis: {
        id: analysis._id,
        title: analysis.title,
        description: analysis.description,
        configuration: analysis.configuration,
        results: analysis.results,
        status: analysis.status,
        error: analysis.error,
        processingTime: analysis.processingTime,
        isPublic: analysis.isPublic,
        viewCount: analysis.viewCount,
        downloadCount: analysis.downloadCount,
        tags: analysis.tags,
        charts,
        file: analysis.fileId,
        user: analysis.userId,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ analyticsController: Get analysis details error:', error);
    res.status(500).json({ 
      message: 'Error fetching analysis details', 
      error: error.message 
    });
  }
};

// Update analysis
const updateAnalysis = async (req, res) => {
  console.log('✏️ analyticsController: updateAnalysis - Analysis:', req.params.analysisId, 'User:', req.user._id);
  
  try {
    const { analysisId } = req.params;
    const { title, description, tags, isPublic } = req.body;
    
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user._id
    });
    
    if (!analysis) {
      console.log('❌ analyticsController: Analysis not found or access denied:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    const updates = {};
    if (title !== undefined) {
      updates.title = title;
      console.log('📝 analyticsController: Updating title to:', title);
    }
    if (description !== undefined) {
      updates.description = description;
      console.log('📄 analyticsController: Updating description');
    }
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      console.log('🏷️ analyticsController: Updating tags:', updates.tags);
    }
    if (isPublic !== undefined) {
      updates.isPublic = isPublic;
      console.log('🌐 analyticsController: Updating visibility to:', isPublic ? 'public' : 'private');
    }
    
    const updatedAnalysis = await Analysis.findByIdAndUpdate(
      analysisId,
      updates,
      { new: true, runValidators: true }
    );
    
    console.log('✅ analyticsController: Analysis updated successfully');
    
    res.json({
      message: 'Analysis updated successfully',
      analysis: {
        id: updatedAnalysis._id,
        title: updatedAnalysis.title,
        description: updatedAnalysis.description,
        tags: updatedAnalysis.tags,
        isPublic: updatedAnalysis.isPublic,
        updatedAt: updatedAnalysis.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ analyticsController: Update analysis error:', error);
    res.status(500).json({ 
      message: 'Error updating analysis', 
      error: error.message 
    });
  }
};

// Delete analysis
const deleteAnalysis = async (req, res) => {
  console.log('🗑️ analyticsController: deleteAnalysis - Analysis:', req.params.analysisId, 'User:', req.user._id);
  
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user._id
    });
    
    if (!analysis) {
      console.log('❌ analyticsController: Analysis not found or access denied:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    // Delete associated charts
    console.log('🗑️ analyticsController: Deleting associated charts...');
    await Chart.deleteMany({ analysisId: analysis._id });
    
    // Delete the analysis
    console.log('🗑️ analyticsController: Deleting analysis record...');
    await Analysis.findByIdAndDelete(analysisId);
    
    console.log('✅ analyticsController: Analysis deleted successfully');
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('❌ analyticsController: Delete analysis error:', error);
    res.status(500).json({ 
      message: 'Error deleting analysis', 
      error: error.message 
    });
  }
};

// Get chart data
const getChartData = async (req, res) => {
  console.log('📊 analyticsController: getChartData - Analysis:', req.params.analysisId);
  
  try {
    const { analysisId } = req.params;
    const { format = 'json' } = req.query;
    
    const analysis = await Analysis.findOne({
      _id: analysisId,
      $or: [
        { userId: req.user._id },
        { isPublic: true }
      ]
    });
    
    if (!analysis) {
      console.log('❌ analyticsController: Analysis not found or access denied:', analysisId);
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    if (analysis.status !== 'completed') {
      console.log('⚠️ analyticsController: Analysis not completed yet:', analysis.status);
      return res.status(400).json({ 
        message: 'Analysis is not yet completed' 
      });
    }
    
    // Increment view count
    if (req.user._id.toString() !== analysis.userId.toString()) {
      console.log('📈 analyticsController: Incrementing view count...');
      await Analysis.findByIdAndUpdate(analysisId, {
        $inc: { viewCount: 1 }
      });
    }
    
    const chartData = analysis.results.processedData;
    
    if (format === 'csv') {
      console.log('📄 analyticsController: Converting to CSV format...');
      // Convert to CSV format
      const csv = convertToCSV(chartData.chartData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${analysis.title}.csv"`);
      return res.send(csv);
    }
    
    console.log('✅ analyticsController: Chart data retrieved successfully');
    res.json({
      chartData: chartData.chartData,
      chartConfig: chartData.chartConfig,
      statistics: analysis.results.statistics,
      insights: analysis.results.insights
    });
  } catch (error) {
    console.error('❌ analyticsController: Get chart data error:', error);
    res.status(500).json({ 
      message: 'Error fetching chart data', 
      error: error.message 
    });
  }
};

// Convert chart data to CSV format
const convertToCSV = (chartData) => {
  if (!chartData.labels || !chartData.datasets) {
    return '';
  }
  
  const headers = ['Label', ...chartData.datasets.map(ds => ds.label || 'Data')];
  const rows = [headers.join(',')];
  
  chartData.labels.forEach((label, index) => {
    const row = [label];
    chartData.datasets.forEach(dataset => {
      row.push(dataset.data[index] || '');
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
};

// TODO: Add more analysis controller functions
// const duplicateAnalysis = async (req, res) => {
//   console.log('📋 analyticsController: duplicateAnalysis - Analysis:', req.params.analysisId);
//   // TODO: Implement analysis duplication
// };

// const shareAnalysis = async (req, res) => {
//   console.log('🔗 analyticsController: shareAnalysis - Analysis:', req.params.analysisId);
//   // TODO: Implement analysis sharing functionality
// };

// const exportAnalysis = async (req, res) => {
//   console.log('📤 analyticsController: exportAnalysis - Analysis:', req.params.analysisId);
//   // TODO: Implement analysis export to various formats
// };

// const bulkDeleteAnalyses = async (req, res) => {
//   console.log('🗑️ analyticsController: bulkDeleteAnalyses - User:', req.user._id);
//   // TODO: Implement bulk deletion of analyses
// };

module.exports = {
  createAnalysis,
  getUserAnalyses,
  getAnalysisDetails,
  updateAnalysis,
  deleteAnalysis,
  getChartData
  // TODO: Export additional functions when implemented
};