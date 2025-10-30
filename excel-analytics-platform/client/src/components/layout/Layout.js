import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // TODO: Add animations for sidebar open/close transitions
  // TODO: Persist sidebar state in localStorage
  
  console.log('📱 Layout rendered - Mobile:', isMobile, 'Sidebar:', sidebarOpen);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
    console.log('🔄 Sidebar toggled:', !sidebarOpen ? 'opened' : 'closed');
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    console.log('❌ Sidebar closed');
  };

  // Debug theme changes
  React.useEffect(() => {
    console.log('🎨 Theme changed:', theme.palette.mode);
  }, [theme.palette.mode]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header onSidebarToggle={handleSidebarToggle} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          ml: {
            md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          },
          mt: '64px', // Height of AppBar - TODO: Make this dynamic based on AppBar height
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            height: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;