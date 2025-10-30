// TODO: Add drag & drop reordering for files
// TODO: Implement file version control
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Pagination,
} from '@mui/material';
import {
  CloudUpload,
  MoreVert,
  Download,
  Delete,
  Edit,
  Visibility,
  Add,
  Search,
  FilterList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { filesAPI } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useNotification } from '../contexts/NotificationContext';
import { formatFileSize, formatDate } from '../utils/helpers';

console.log('Files component loaded...');

const Files = () => {
  // TODO: Add file sharing functionality
  // TODO: Implement bulk operations (delete, download multiple)
  const navigate = useNavigate();
  const { execute, loading } = useAsync();
  const { showSuccess, showError } = useNotification();
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
  });

  console.log('Files component mounted');
  console.log('Current filters:', filters);
  console.log('Total files loaded:', files.length);

  useEffect(() => {
    console.log('Files effect triggered for page:', filters.page);
    loadFiles();
    // TODO: Add debouncing for search queries
  }, [filters.page]);

  const loadFiles = async () => {
    console.log('Loading files with filters:', filters);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      };
      
      const response = await execute(() => filesAPI.getUserFiles(params));
      console.log('Files loaded:', response.data.files.length);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
      // TODO: Add cache invalidation strategy
    } catch (error) {
      console.error('Error loading files:', error);
      // TODO: Show user-friendly error with retry button
      // TODO: Implement offline mode with cached files
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      console.warn('No file provided in drop');
      return;
    }

    console.log('File dropped:', file.name, 'Size:', file.size);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      console.log('Starting file upload...');
      const response = await execute(() => 
        filesAPI.uploadFile(formData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
          if (progress % 25 === 0) console.log('Upload progress:', progress + '%');
        })
      );
      
      console.log('File uploaded successfully:', response.data);
      showSuccess('File uploaded successfully!');
      setUploadDialog(false);
      loadFiles(); // Reload files list
      // TODO: Track upload analytics
      // TODO: Add file processing status updates
    } catch (error) {
      console.error('File upload failed:', error);
      showError('Failed to upload file');
      // TODO: Add detailed error messages (file too large, invalid format, etc.)
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [execute, showSuccess, showError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleMenuOpen = (event, file) => {
    console.log('Opening menu for file:', file.originalName);
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
    // TODO: Add analytics tracking for menu opens
  };

  const handleMenuClose = () => {
    console.log('Closing file menu');
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleFileAction = async (action) => {
    if (!selectedFile) {
      console.warn('No file selected for action:', action);
      return;
    }

    console.log('Performing action:', action, 'on file:', selectedFile.originalName);
    try {
      switch (action) {
        case 'view':
          console.log('Navigating to file details...');
          navigate(`/files/${selectedFile.id}`);
          break;
        case 'download':
          console.log('Initiating file download...');
          const response = await execute(() => filesAPI.downloadFile(selectedFile.id));
          // Create download link
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', selectedFile.originalName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          console.log('File downloaded successfully');
          showSuccess('File downloaded successfully!');
          // TODO: Add download analytics and progress tracking
          break;
        case 'delete':
          console.log('Initiating file deletion...');
          if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            await execute(() => filesAPI.deleteFile(selectedFile.id));
            console.log('File deleted successfully');
            showSuccess('File deleted successfully!');
            loadFiles();
            // TODO: Add undo functionality
          }
          break;
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      showError(`Failed to ${action} file`);
      // TODO: Add specific error handling for each action type
    }
    
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    // TODO: Add more status types (pending, uploading, processing, etc.)
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const FileCard = ({ file }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* TODO: Add thumbnail preview for Excel files */}
      {/* TODO: Implement drag & drop reordering */}
      {/* DEBUG: FileCard rendered for */}{file.originalName}
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => {
          console.log('File card clicked:', file.originalName);
          navigate(`/files/${file.id}`);
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 1,
                }}
              >
                {file.originalName}
              </Typography>
              <Chip
                label={file.status}
                color={getStatusColor(file.status)}
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, file);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Size: {formatFileSize(file.size)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Uploaded: {formatDate(file.createdAt)}
          </Typography>
          
          {file.metadata && file.metadata.totalRows && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {file.metadata.totalRows} rows
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {file.metadata.totalColumns} columns
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              My Files
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload and manage your Excel files for analysis
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => {
              console.log('Upload dialog opened');
              setUploadDialog(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Upload File
          </Button>
        </Box>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search files..."
                  value={filters.search}
                  onChange={(e) => {
                    console.log('Search query changed:', e.target.value);
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => {
                      console.log('Status filter changed:', e.target.value);
                      setFilters(prev => ({ ...prev, status: e.target.value }));
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    console.log('Applying filters:', filters);
                    loadFiles();
                  }}
                  startIcon={<FilterList />}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Files Grid */}
      {loading && files.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading files...</Typography>
        </Box>
      ) : files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <CloudUpload sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No files uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your first Excel file to get started with data analysis
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => {
                  console.log('Upload dialog opened from empty state');
                  setUploadDialog(true);
                }}
              >
                Upload Your First File
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            <Grid container spacing={3}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <FileCard file={file} />
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.current}
                onChange={(e, page) => {
                  console.log('Page changed to:', page);
                  setFilters(prev => ({ ...prev, page }));
                }}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => !uploading && setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Excel File</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragActive ? 'primary.light' : 'background.paper',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            {uploading ? (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
                {/* TODO: Add cancel upload button */}
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop an Excel file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse (.xlsx, .xls files only)
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleFileAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleFileAction('download')}>
          <Download sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={() => handleFileAction('delete')}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={() => setUploadDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Files;