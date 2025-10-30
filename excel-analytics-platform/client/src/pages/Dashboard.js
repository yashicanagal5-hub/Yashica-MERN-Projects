// TODO: Add real-time data updates with WebSocket
// TODO: Implement custom dashboard layouts
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Analytics,
  Assessment,
  Storage,
  MoreVert,
  TrendingUp,
  FilePresent,
  Speed,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useNotification } from '../contexts/NotificationContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

console.log('Dashboard component loaded...');

const Dashboard = () => {
  // TODO: Add dashboard customization (drag & drop widgets)
  // TODO: Implement dashboard sharing and collaboration
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useAsync();
  const { showError } = useNotification();
  const [dashboardData, setDashboardData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  console.log('Dashboard component mounted');
  console.log('Current user:', user ? user.name : 'not found');

  useEffect(() => {
    console.log('Dashboard effect triggered');
    loadDashboardData();
    // TODO: Set up real-time updates with WebSocket
    // TODO: Add dashboard auto-refresh functionality
  }, []);

  const loadDashboardData = async () => {
    console.log('Loading dashboard data...');
    try {
      const response = await execute(() => userAPI.getDashboard());
      console.log('Dashboard data loaded:', response.data);
      setDashboardData(response.data);
      // TODO: Add caching mechanism for better performance
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
      // TODO: Show retry button and error state
    }
  };

  const handleMenuOpen = (event) => {
    console.log('Opening chart options menu');
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    console.log('Closing chart options menu');
    setAnchorEl(null);
  };

  // Sample chart data (TODO: Replace with real data from API)
  // TODO: Add chart data caching and real-time updates
  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Files Uploaded',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Analyses Created',
        data: [2, 3, 20, 5, 1, 4, 9],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // TODO: Implement dynamic chart colors based on theme
  const chartTypeData = {
    labels: ['Line Charts', 'Bar Charts', 'Pie Charts', 'Scatter Plots'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
        ],
      },
    ],
  };

  const storageData = {
    labels: ['Excel Files', 'CSV Files', 'Other'],
    datasets: [
      {
        label: 'Storage (MB)',
        data: [120, 80, 40],
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56'],
      },
    ],
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add click handler for drill-down functionality */}
      {/* TODO: Implement hover animations and micro-interactions */}
      {/* DEBUG: StatCard rendered for */}{title}
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: color, mr: 2, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
              <Typography variant="body2" color="success.main">
                {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add loading states and success animations */}
      {/* TODO: Implement keyboard navigation */}
      {/* DEBUG: QuickActionCard rendered for */}{title}
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
          console.log('Upload action clicked');
          onClick();
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading && !dashboardData) {
    console.log('Dashboard loading...');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  // DEBUG: Dashboard component rendered
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* TODO: Add dashboard layout customization */}
      {/* TODO: Implement widget resizing and repositioning */}
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
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
            Welcome back, {user?.name?.split(' ')[0]}! 👋
            {/* TODO: Add personalized greeting based on time of day */}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your analytics today.
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Files"
            value="24"
            icon={<FilePresent />}
            color="#1976d2"
            subtitle="Excel & CSV files"
            trend="+12% this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Analyses Created"
            value="18"
            icon={<Analytics />}
            color="#388e3c"
            subtitle="Data visualizations"
            trend="+8% this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Storage Used"
            value="2.4 GB"
            icon={<Storage />}
            color="#f57c00"
            subtitle="of 10 GB limit"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Processing"
            value="1.2s"
            icon={<Speed />}
            color="#7b1fa2"
            subtitle="File analysis time"
            trend="25% faster"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Upload File"
              description="Upload Excel files to start analyzing your data"
              icon={<CloudUpload />}
              color="#1976d2"
              onClick={() => {
                console.log('Navigating to files page...');
                navigate('/files');
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Create Analysis"
              description="Generate charts and insights from your data"
              icon={<Assessment />}
              color="#388e3c"
              onClick={() => {
                console.log('Navigating to analytics page...');
                navigate('/analytics');
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="View Reports"
              description="Browse and manage your existing analyses"
              icon={<Analytics />}
              color="#f57c00"
              onClick={() => {
                console.log('Navigating to analytics page...');
                navigate('/analytics');
              }}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Activity Overview
                  </Typography>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                  </IconButton>
                </Box>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={activityChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      // TODO: Add chart animation configuration
                      // TODO: Implement chart export functionality
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Chart Types
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Doughnut
                        data={chartTypeData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                          // TODO: Add chart interaction callbacks
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Storage Usage
                    </Typography>
                    <Box sx={{ height: 150 }}>
                      <Bar
                        data={storageData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                          // TODO: Add data labels and tooltips
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Menu for chart options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          console.log('Export chart selected');
          handleMenuClose();
        }}>Export Chart</MenuItem>
        <MenuItem onClick={() => {
          console.log('View details selected');
          handleMenuClose();
        }}>View Details</MenuItem>
        <MenuItem onClick={() => {
          console.log('Refresh data selected');
          loadDashboardData();
          handleMenuClose();
        }}>Refresh Data</MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;