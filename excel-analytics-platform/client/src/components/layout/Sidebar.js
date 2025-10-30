import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as FilesIcon,
  Analytics as AnalyticsIcon,
  Person as ProfileIcon,
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  FolderOpen as AdminFilesIcon,
  Assessment as AdminAnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const DRAWER_WIDTH = 280;

// TODO: Move these to a separate constants file
// TODO: Add icons for better UX
// TODO: Add badge/notification indicators for pending items
const userMenuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Files',
    icon: <FilesIcon />,
    path: '/files',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
  },
  {
    text: 'Profile',
    icon: <ProfileIcon />,
    path: '/profile',
  },
];

const adminMenuItems = [
  {
    text: 'Admin Dashboard',
    icon: <AdminIcon />,
    path: '/admin/dashboard',
  },
  {
    text: 'Users',
    icon: <UsersIcon />,
    path: '/admin/users',
  },
  {
    text: 'Files',
    icon: <AdminFilesIcon />,
    path: '/admin/files',
  },
  {
    text: 'Analyses',
    icon: <AdminAnalyticsIcon />,
    path: '/admin/analyses',
  },
];

const Sidebar = ({ open, onClose, variant = 'temporary' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const isAdmin = user?.role === 'admin';

  console.log('🔍 Sidebar props:', { open, variant, isAdmin, userRole: user?.role });

  const handleNavigation = (path) => {
    console.log('🧭 Navigating to:', path);
    navigate(path);
    // Only close on mobile - on desktop we keep sidebar open for easy navigation
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActivePath = (path) => {
    // Special case for dashboard (home page)
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    console.log(`🏷️  Path "${path}" is ${isActive ? 'active' : 'inactive'} for "${location.pathname}"`);
    return isActive;
  };

  const DrawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        background: darkMode
          ? 'linear-gradient(180deg, #1a1a1a 0%, #2d3748 100%)'
          : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* User Info Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: darkMode ? 'white' : 'grey.800',
            fontWeight: 600,
            mb: 1,
          }}
        >
          Welcome, {user?.name?.split(' ')[0]}!
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            color={isAdmin ? 'error' : 'primary'}
            variant="outlined"
          />
          <Chip
            label="Active"
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* User Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {userMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActivePath(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'primary.light',
                    color: darkMode ? 'white' : 'primary.main',
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'primary.light',
                    },
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActivePath(item.path)
                      ? darkMode ? 'white' : 'primary.main'
                      : darkMode ? 'grey.400' : 'grey.600',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isActivePath(item.path) ? 600 : 400,
                      color: isActivePath(item.path)
                        ? darkMode ? 'white' : 'primary.main'
                        : darkMode ? 'grey.300' : 'grey.700',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Divider sx={{ mx: 2, my: 2 }} />
            <Typography
              variant="overline"
              sx={{
                px: 3,
                color: darkMode ? 'grey.400' : 'grey.600',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Administration
            </Typography>
            <List sx={{ px: 2, py: 1 }}>
              {adminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActivePath(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'secondary.light',
                        color: darkMode ? 'white' : 'secondary.main',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'secondary.light',
                        },
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActivePath(item.path)
                          ? darkMode ? 'white' : 'secondary.main'
                          : darkMode ? 'grey.400' : 'grey.600',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isActivePath(item.path) ? 600 : 400,
                          color: isActivePath(item.path)
                            ? darkMode ? 'white' : 'secondary.main'
                            : darkMode ? 'grey.300' : 'grey.700',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: darkMode ? 'grey.500' : 'grey.600',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Yashica -Excel Analytics Platform v1.0
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: darkMode ? 'grey.500' : 'grey.600',
            display: 'block',
            textAlign: 'center',
            mt: 0.5,
          }}
        >
          © 2024 Yashica Nagal
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: darkMode
            ? '4px 0 8px rgba(0,0,0,0.3)'
            : '4px 0 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      {DrawerContent}
    </Drawer>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };