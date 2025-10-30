import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const Header = ({ onSidebarToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  console.log('🏢 Header rendered - User:', user?.name, 'Theme:', darkMode ? 'dark' : 'light');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    console.log('👤 Profile menu opened');
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    console.log('👤 Profile menu closed');
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    console.log('🔔 Notification menu opened');
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
    console.log('🔔 Notification menu closed');
  };

  const handleLogout = () => {
    console.log('🚪 User logging out');
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    console.log('📋 Navigating to profile');
    navigate('/profile');
    handleProfileMenuClose();
  };

  // TODO: Add keyboard shortcuts
  // TODO: Add search functionality
  // TODO: Add user activity indicators

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: darkMode
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onSidebarToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Yashica -Excel Analytics Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Button
            color="inherit"
            onClick={handleProfileMenuOpen}
            startIcon={
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            }
            sx={{
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {user?.name || 'User'}
          </Button>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile}>
            <PersonIcon sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <SettingsIcon sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 300,
              maxHeight: 400,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              File "Sales_Data.xlsx" has been processed successfully
            </Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              New analysis "Q4 Revenue Trends" is ready
            </Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              System maintenance scheduled for tonight
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;