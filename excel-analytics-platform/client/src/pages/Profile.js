// TODO: Replace with proper types later - need to set up TypeScript
// Also need to add user profile picture upload feature
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useNotification } from '../contexts/NotificationContext';
import { formatFileSize, formatDate } from '../utils/helpers';

console.log('Profile component loaded...');

const Profile = () => {
  // TODO: Add loading states for each tab separately
  // TODO: Implement undo functionality for profile edits
  const { user, updateUser } = useAuth();
  const { execute, loading } = useAsync();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    defaultChartType: 'line',
    ...user?.preferences,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userStats, setUserStats] = useState(null);

  console.log('Profile mounted, user:', user ? 'found' : 'not found');
  console.log('Current active tab:', activeTab);
  console.log('Edit mode:', isEditing);

  useEffect(() => {
    console.log('Profile useEffect triggered');
    loadUserStats();
    // TODO: Add error boundary to handle profile loading errors gracefully
  }, []);

  const loadUserStats = async () => {
    console.log('Loading user stats...');
    try {
      const response = await execute(() => authAPI.getUserStats());
      console.log('User stats loaded:', response.data.stats);
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // TODO: Show user-friendly error message instead of just logging
      // TODO: Implement retry mechanism for failed stats loading
    }
  };

  const handleProfileSave = async () => {
    console.log('Attempting to save profile:', profileData);
    try {
      const response = await execute(() => authAPI.updateProfile(profileData));
      console.log('Profile updated successfully:', response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
      // TODO: Add analytics tracking for profile updates
    } catch (error) {
      console.error('Profile save failed:', error);
      showError('Failed to update profile');
    }
  };

  const handlePreferencesSave = async () => {
    console.log('Saving preferences:', preferences);
    try {
      await execute(() => userAPI.updatePreferences(preferences));
      updateUser({ preferences });
      console.log('Preferences saved successfully');
      showSuccess('Preferences updated successfully!');
      // TODO: Add toast notification with undo option
    } catch (error) {
      console.error('Preferences save failed:', error);
      showError('Failed to update preferences');
    }
  };

  const handlePasswordChange = async () => {
    console.log('Initiating password change...');
    // TODO: Add password strength indicator
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.warn('Passwords do not match');
      showError('Passwords do not match');
      return;
    }

    // TODO: Add additional password validation (length, special chars, etc.)
    try {
      await execute(() => authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }));
      console.log('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showSuccess('Password changed successfully!');
      // TODO: Send email notification about password change
    } catch (error) {
      console.error('Password change failed:', error);
      showError('Failed to change password');
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // TODO: Add tab persistence in URL (e.g., #security-tab)
  // TODO: Add keyboard navigation between tabs

  const ProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add profile picture upload functionality */}
      {/* TODO: Implement auto-save for text fields */}
      {/* DEBUG: ProfileTab rendered */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
                {/* TODO: Add fallback avatar for users without names */}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user?.name}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                color={user?.role === 'admin' ? 'error' : 'primary'}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Member since {formatDate(user?.createdAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                      console.log('Entering edit mode');
                      setIsEditing(true);
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        console.log('Cancelling edit mode');
                        setIsEditing(false);
                        setProfileData({ name: user?.name || '', email: user?.email || '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
                {/* TODO: Add 'Reset to defaults' button for admin users */}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => {
                      console.log('Name changed:', e.target.value);
                      setProfileData(prev => ({ ...prev, name: e.target.value }));
                    }}
                    disabled={!isEditing}
                  />
                  {/* TODO: Add name validation (no numbers, min length, etc.) */}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={user?.role?.toUpperCase()}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Status"
                    value={user?.isActive ? 'Active' : 'Inactive'}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const PreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add real-time preview of theme changes */}
      {/* TODO: Add notification preferences customization */}
      {/* DEBUG: PreferencesTab rendered */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Application Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.theme === 'dark'}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      theme: e.target.checked ? 'dark' : 'light'
                    }))}
                  />
                }
                label="Dark Mode"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: e.target.checked
                    }))}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Default Chart Type"
                value={preferences.defaultChartType}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  defaultChartType: e.target.value
                }))}
                SelectProps={{ native: true }}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="pie">Pie Chart</option>
              </TextField>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handlePreferencesSave}
              disabled={loading}
            >
              Save Preferences
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add password strength indicator */}
      {/* TODO: Add 2FA settings */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Change Password
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            >
              Change Password
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const UsageTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* TODO: Add usage charts and trends */}
      {/* TODO: Add data export functionality */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Storage Usage
              </Typography>
              
              {userStats ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Used Storage</Typography>
                      <Typography variant="body2">
                        {formatFileSize(userStats.user?.storageUsed || 0)} / 10 GB
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(userStats.user?.storageUsed || 0) / (10 * 1024 * 1024 * 1024) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Files"
                        secondary={userStats.files?.totalFiles || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Total Analyses"
                        secondary={userStats.user?.totalAnalyses || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Average File Size"
                        secondary={formatFileSize(userStats.files?.avgSize || 0)}
                      />
                    </ListItem>
                  </List>
                </>
              ) : (
                <LinearProgress />
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activity Summary
              </Typography>
              
              {userStats && (
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Completed Analyses"
                      secondary={userStats.analyses?.completed || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Processing"
                      secondary={userStats.analyses?.processing || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Failed"
                      secondary={userStats.analyses?.error || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Login"
                      secondary={user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  // DEBUG: Profile component rendered with user data
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* TODO: Add breadcrumb navigation */}
      {/* TODO: Add profile completion progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
          }}
        >
          Profile Settings
        </Typography>
      </motion.div>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              console.log('Tab changed from', activeTab, 'to', newValue);
              setActiveTab(newValue);
            }}
            aria-label="profile tabs"
          >
            <Tab icon={<PersonIcon />} label="Profile" />
            <Tab icon={<SettingsIcon />} label="Preferences" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<StorageIcon />} label="Usage" />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <ProfileTab />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <PreferencesTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <SecurityTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <UsageTab />
        </TabPanel>
      </Card>
    </Container>
  );
};

export default Profile;