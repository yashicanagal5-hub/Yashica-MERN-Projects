// TODO: Add analytics sharing and collaboration features
// TODO: Implement analytics templates for common use cases
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Fab,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Analytics as AnalyticsIcon,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  Search,
  FilterList,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatRelativeTime } from '../utils/helpers';

console.log('Analytics component loaded...');

const Analytics = () => {
  // TODO: Add analytics versioning and rollback
  // TODO: Implement bulk operations for analytics
  const navigate = useNavigate();
  const { execute, loading } = useAsync();
  const { showSuccess, showError } = useNotification();
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    chartType: '',
    page: 1,
  });

  console.log('Analytics component mounted');
  console.log('Current filters:', filters);
  console.log('Total analyses loaded:', analyses.length);

  useEffect(() => {
    console.log('Analytics effect triggered for page:', filters.page);
    loadAnalyses();
    // TODO: Add debouncing for search queries
  }, [filters.page]);

  const loadAnalyses = async () => {
    console.log('Loading analyses with filters:', filters);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.chartType && { chartType: filters.chartType }),
      };
      
      const response = await execute(() => analyticsAPI.getUserAnalyses(params));
      console.log('Analyses loaded:', response.data.analyses.length);
      setAnalyses(response.data.analyses);
      setPagination(response.data.pagination);
      // TODO: Add cache invalidation strategy
    } catch (error) {
      console.error('Error loading analyses:', error);
      // TODO: Show user-friendly error with retry button
      // TODO: Implement offline mode with cached analyses
    }
  };

  const handleMenuOpen = (event, analysis) => {
    console.log('Opening menu for analysis:', analysis.title);
    setAnchorEl(event.currentTarget);
    setSelectedAnalysis(analysis);
    // TODO: Add analytics tracking for menu opens
  };

  const handleMenuClose = () => {
    console.log('Closing analysis menu');
    setAnchorEl(null);
    setSelectedAnalysis(null);
  };

  const handleAnalysisAction = async (action) => {
    if (!selectedAnalysis) {
      console.warn('No analysis selected for action:', action);
      return;
    }

    console.log('Performing action:', action, 'on analysis:', selectedAnalysis.title);
    try {
      switch (action) {
        case 'view':
          console.log('Navigating to analysis details...');
          navigate(`/analytics/${selectedAnalysis.id}`);
          break;
        case 'delete':
          console.log('Initiating analysis deletion...');
          if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
            await execute(() => analyticsAPI.deleteAnalysis(selectedAnalysis.id));
            console.log('Analysis deleted successfully');
            showSuccess('Analysis deleted successfully!');
            loadAnalyses();
            // TODO: Add undo functionality
          }
          break;
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      showError(`Failed to ${action} analysis`);
      // TODO: Add specific error handling for each action type
    }
    
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    // TODO: Add more status types (draft, published, archived, etc.)
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getChartTypeIcon = (chartType) => {
    switch (chartType) {
      case 'line': return '📈';
      case 'bar': return '📋';
      case 'pie': return '🍰';
      case 'scatter': return '•';
      case 'area': return '🏔️';
      default: return '📉';
    }
  };

  const AnalysisCard = ({ analysis }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* TODO: Add thumbnail preview of chart */}
      {/* TODO: Implement drag & drop reordering */}
      {/* DEBUG: AnalysisCard rendered for */}{analysis.title}
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
          console.log('Analysis card clicked:', analysis.title);
          navigate(`/analytics/${analysis.id}`);
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
                {analysis.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={analysis.status}
                  color={getStatusColor(analysis.status)}
                  size="small"
                />
                <Chip
                  label={`${getChartTypeIcon(analysis.configuration.chartType)} ${analysis.configuration.chartType}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, analysis);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
          
          {analysis.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {analysis.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(analysis.createdAt)}
            </Typography>
            
            {analysis.viewCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary">
                  {analysis.viewCount}
                </Typography>
              </Box>
            )}
          </Box>
          
          {analysis.processingTime && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Processed in {(analysis.processingTime / 1000).toFixed(2)}s
            </Typography>
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
              Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage your data visualizations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              console.log('Create analysis dialog opened');
              setCreateDialog(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Create Analysis
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search analyses..."
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
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={filters.chartType}
                    label="Chart Type"
                    onChange={(e) => {
                      console.log('Chart type filter changed:', e.target.value);
                      setFilters(prev => ({ ...prev, chartType: e.target.value }));
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                    <MenuItem value="scatter">Scatter Plot</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    console.log('Applying filters:', filters);
                    loadAnalyses();
                  }}
                  startIcon={<FilterList />}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analyses Grid */}
      {loading && analyses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading analyses...</Typography>
        </Box>
      ) : analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Assessment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No analyses created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first analysis to start visualizing your data
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  console.log('Create analysis dialog opened from empty state');
                  setCreateDialog(true);
                }}
              >
                Create Your First Analysis
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            <Grid container spacing={3}>
              {analyses.map((analysis) => (
                <Grid item xs={12} sm={6} md={4} key={analysis.id}>
                  <AnalysisCard analysis={analysis} />
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

      {/* Create Analysis Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Analysis</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To create a new analysis, you need to first upload an Excel file.
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              console.log('Navigating to files page...');
              setCreateDialog(false);
              navigate('/files');
            }}
            sx={{ mb: 2 }}
          >
            Upload File First
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              console.log('Opening file selector...');
              setCreateDialog(false);
              // This would open a file selector for existing files
              navigate('/files');
            }}
          >
            Choose from Existing Files
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            console.log('Create analysis dialog cancelled');
            setCreateDialog(false);
          }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAnalysisAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleAnalysisAction('edit')}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleAnalysisAction('delete')}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="create analysis"
        onClick={() => {
          console.log('Create analysis dialog opened from FAB');
          setCreateDialog(true);
        }}
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

export default Analytics;