const UploadedFile = require('../models/UploadedFile');
const { parseExcelFile, getSampleData } = require('../services/excelParser');
const { cleanupFiles } = require('../middleware/fileUpload');
const fs = require('fs-extra');
const path = require('path');

console.log('📁 fileController: Loading file management controllers');

// Upload Excel file
const uploadFile = async (req, res) => {
  console.log('📤 fileController: uploadFile - User:', req.user._id);
  
  try {
    if (!req.file) {
      console.log('⚠️ fileController: No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    const { description, tags } = req.body;
    
    console.log('📄 fileController: File details - Name:', originalname, 'Size:', size, 'Type:', mimetype);
    
    // Create file record
    const uploadedFile = new UploadedFile({
      filename,
      originalName: originalname,
      path: filePath,
      size,
      mimetype,
      uploadedBy: req.user._id,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: 'processing'
    });
    
    console.log('💾 fileController: Saving file record to database...');
    await uploadedFile.save();
    
    // Process the Excel file asynchronously
    console.log('🔄 fileController: Starting async file processing...');
    processExcelFile(uploadedFile._id, filePath)
      .catch(error => {
        console.error('❌ fileController: Error processing Excel file:', error);
        // Update file status to error
        UploadedFile.findByIdAndUpdate(uploadedFile._id, {
          status: 'error',
          processingError: error.message
        }).catch(console.error);
      });
    
    console.log('✅ fileController: File uploaded successfully and processing started:', uploadedFile._id);
    
    res.status(201).json({
      message: 'File uploaded successfully and is being processed',
      file: {
        id: uploadedFile._id,
        originalName: uploadedFile.originalName,
        size: uploadedFile.size,
        status: uploadedFile.status,
        createdAt: uploadedFile.createdAt
      }
    });
  } catch (error) {
    console.error('❌ fileController: Upload file error:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file) {
      console.log('🧹 fileController: Cleaning up uploaded file due to error...');
      cleanupFiles(req.file);
    }
    
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
};

// Process Excel file asynchronously
const processExcelFile = async (fileId, filePath) => {
  console.log(`⚙️ fileController: Processing Excel file ${fileId}...`);
  
  try {
    // Parse the Excel file
    const { sheets, metadata } = await parseExcelFile(filePath);
    
    console.log('📊 fileController: Excel file parsed successfully, sheets:', Object.keys(sheets));
    
    // Update file record with metadata
    await UploadedFile.findByIdAndUpdate(fileId, {
      'metadata.sheets': Object.keys(sheets),
      'metadata.totalRows': metadata.totalRows,
      'metadata.totalColumns': metadata.totalColumns,
      'metadata.columnHeaders': metadata.columnHeaders,
      'metadata.dataTypes': Object.keys(sheets).reduce((acc, sheetName) => {
        acc[sheetName] = sheets[sheetName].dataTypes;
        return acc;
      }, {}),
      processed: true,
      status: 'completed'
    });
    
    console.log(`✅ fileController: Successfully processed file ${fileId}`);
  } catch (error) {
    console.error(`❌ fileController: Error processing file ${fileId}:`, error);
    throw error;
  }
};

// Get user's uploaded files
const getUserFiles = async (req, res) => {
  console.log('📋 fileController: getUserFiles - User:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = req.query;
    
    const query = { uploadedBy: req.user._id };
    
    // Filter by status
    if (status) {
      query.status = status;
      console.log('🔍 fileController: Filtering by status:', status);
    }
    
    // Search in filename or description
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      console.log('🔍 fileController: Searching with term:', search);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('📁 fileController: Fetching files - Page:', page, 'Limit:', limit, 'Sort:', sortBy, sortOrder);
    
    const files = await UploadedFile.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('analyses', 'title status createdAt')
      .select('-path'); // Don't expose file path
    
    const total = await UploadedFile.countDocuments(query);
    
    console.log(`✅ fileController: Found ${files.length} files out of ${total} total`);
    
    res.json({
      files,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ fileController: Get user files error:', error);
    res.status(500).json({ 
      message: 'Error fetching files', 
      error: error.message 
    });
  }
};

// Get specific file details
const getFileDetails = async (req, res) => {
  console.log('📋 fileController: getFileDetails - File:', req.params.fileId, 'User:', req.user._id);
  
  try {
    const { fileId } = req.params;
    
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id
    }).populate('analyses', 'title status createdAt configuration');
    
    if (!file) {
      console.log('❌ fileController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // If file is processed, get sample data
    let sampleData = null;
    if (file.processed && file.status === 'completed') {
      console.log('📊 fileController: File is processed, fetching sample data...');
      try {
        const { sheets } = await parseExcelFile(file.path);
        const firstSheetName = Object.keys(sheets)[0];
        if (firstSheetName) {
          sampleData = getSampleData(sheets[firstSheetName], 5);
          console.log('✅ fileController: Sample data retrieved successfully');
        }
      } catch (error) {
        console.error('⚠️ fileController: Error getting sample data:', error);
      }
    }
    
    console.log('✅ fileController: File details retrieved successfully');
    
    res.json({
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        status: file.status,
        processed: file.processed,
        processingError: file.processingError,
        metadata: file.metadata,
        description: file.description,
        tags: file.tags,
        downloadCount: file.downloadCount,
        analyses: file.analyses,
        sampleData,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ fileController: Get file details error:', error);
    res.status(500).json({ 
      message: 'Error fetching file details', 
      error: error.message 
    });
  }
};

// Get file data for analysis
const getFileData = async (req, res) => {
  console.log('📊 fileController: getFileData - File:', req.params.fileId, 'User:', req.user._id);
  
  try {
    const { fileId } = req.params;
    const { sheet } = req.query;
    
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id
    });
    
    if (!file) {
      console.log('❌ fileController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (!file.processed || file.status !== 'completed') {
      console.log('⚠️ fileController: File not processed or processing failed:', file.status);
      return res.status(400).json({ 
        message: 'File is not yet processed or processing failed' 
      });
    }
    
    // Parse the Excel file to get data
    console.log('📄 fileController: Parsing Excel file...');
    const { sheets } = await parseExcelFile(file.path);
    
    if (sheet && !sheets[sheet]) {
      console.log('❌ fileController: Sheet not found:', sheet);
      return res.status(400).json({ 
        message: `Sheet '${sheet}' not found in file` 
      });
    }
    
    const targetSheet = sheet || Object.keys(sheets)[0];
    const sheetData = sheets[targetSheet];
    
    console.log(`📊 fileController: Returning data for sheet: ${targetSheet}`);
    
    res.json({
      sheetName: targetSheet,
      headers: sheetData.headers,
      data: sheetData.data,
      dataTypes: sheetData.dataTypes,
      rowCount: sheetData.rowCount,
      columnCount: sheetData.columnCount,
      availableSheets: Object.keys(sheets)
    });
  } catch (error) {
    console.error('❌ fileController: Get file data error:', error);
    res.status(500).json({ 
      message: 'Error fetching file data', 
      error: error.message 
    });
  }
};

// Update file metadata
const updateFile = async (req, res) => {
  console.log('✏️ fileController: updateFile - File:', req.params.fileId, 'User:', req.user._id);
  
  try {
    const { fileId } = req.params;
    const { description, tags, isPublic } = req.body;
    
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id
    });
    
    if (!file) {
      console.log('❌ fileController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    const updates = {};
    if (description !== undefined) {
      updates.description = description;
      console.log('📝 fileController: Updating description');
    }
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      console.log('🏷️ fileController: Updating tags:', updates.tags);
    }
    if (isPublic !== undefined) {
      updates.isPublic = isPublic;
      console.log('🌐 fileController: Updating visibility to:', isPublic ? 'public' : 'private');
    }
    
    const updatedFile = await UploadedFile.findByIdAndUpdate(
      fileId,
      updates,
      { new: true, runValidators: true }
    );
    
    console.log('✅ fileController: File updated successfully');
    
    res.json({
      message: 'File updated successfully',
      file: {
        id: updatedFile._id,
        originalName: updatedFile.originalName,
        description: updatedFile.description,
        tags: updatedFile.tags,
        isPublic: updatedFile.isPublic,
        updatedAt: updatedFile.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ fileController: Update file error:', error);
    res.status(500).json({ 
      message: 'Error updating file', 
      error: error.message 
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  console.log('🗑️ fileController: deleteFile - File:', req.params.fileId, 'User:', req.user._id);
  
  try {
    const { fileId } = req.params;
    
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id
    });
    
    if (!file) {
      console.log('❌ fileController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete associated analyses
    const Analysis = require('../models/Analysis');
    console.log('📈 fileController: Deleting associated analyses...');
    await Analysis.deleteMany({ fileId: file._id });
    
    // Delete the physical file
    console.log('🗑️ fileController: Deleting physical file...');
    try {
      await fs.unlink(file.path);
      console.log('✅ fileController: Physical file deleted successfully');
    } catch (error) {
      console.warn('⚠️ fileController: Could not delete physical file:', error.message);
    }
    
    // Delete the database record
    console.log('🗑️ fileController: Deleting database record...');
    await UploadedFile.findByIdAndDelete(fileId);
    
    // Update user stats
    const User = require('../models/User');
    console.log('📊 fileController: Updating user statistics...');
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'stats.totalUploads': -1,
        'stats.storageUsed': -file.size
      }
    });
    
    console.log('✅ fileController: File deleted successfully');
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('❌ fileController: Delete file error:', error);
    res.status(500).json({ 
      message: 'Error deleting file', 
      error: error.message 
    });
  }
};

// Download file
const downloadFile = async (req, res) => {
  console.log('📥 fileController: downloadFile - File:', req.params.fileId);
  
  try {
    const { fileId } = req.params;
    
    const file = await UploadedFile.findOne({
      _id: fileId,
      $or: [
        { uploadedBy: req.user._id },
        { isPublic: true }
      ]
    });
    
    if (!file) {
      console.log('❌ fileController: File not found or access denied:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if file exists
    if (!await fs.pathExists(file.path)) {
      console.log('❌ fileController: File not found on server:', file.path);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Increment download count
    console.log('📈 fileController: Incrementing download count...');
    await UploadedFile.findByIdAndUpdate(fileId, {
      $inc: { downloadCount: 1 }
    });
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    console.log('📥 fileController: Starting file download...');
    
    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
    
    console.log('✅ fileController: File download initiated successfully');
  } catch (error) {
    console.error('❌ fileController: Download file error:', error);
    res.status(500).json({ 
      message: 'Error downloading file', 
      error: error.message 
    });
  }
};

// TODO: Add more file controller functions
// const duplicateFile = async (req, res) => {
//   console.log('📋 fileController: duplicateFile - File:', req.params.fileId);
//   // TODO: Implement file duplication
// };

// const bulkDeleteFiles = async (req, res) => {
//   console.log('🗑️ fileController: bulkDeleteFiles - User:', req.user._id);
//   // TODO: Implement bulk file deletion
// };

// const moveFile = async (req, res) => {
//   console.log('📁 fileController: moveFile - File:', req.params.fileId);
//   // TODO: Implement file organization features
// };

// const createFolder = async (req, res) => {
//   console.log('📁 fileController: createFolder - User:', req.user._id);
//   // TODO: Implement folder organization system
// };

// const getFilePreview = async (req, res) => {
//   console.log('👁️ fileController: getFilePreview - File:', req.params.fileId);
//   // TODO: Implement file preview functionality
// };

module.exports = {
  uploadFile,
  getUserFiles,
  getFileDetails,
  getFileData,
  updateFile,
  deleteFile,
  downloadFile
  // TODO: Export additional functions when implemented
};