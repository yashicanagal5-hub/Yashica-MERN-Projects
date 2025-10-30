import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error', 'warning', 'info', 'success'
    duration: 6000,
  });

  // TODO: Add queue system for multiple notifications
  // TODO: Add animation effects for show/hide
  // TODO: Add maximum notifications limit

  const showNotification = (message, severity = 'info', duration = 6000) => {
    console.log('🔔 Showing notification:', { message, severity, duration });
    setNotification({
      open: true,
      message,
      severity,
      duration,
    });
  };

  const hideNotification = () => {
    console.log('🚫 Hiding notification');
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  };

  // Convenience methods for different notification types
  const showSuccess = (message, duration) => showNotification(message, 'success', duration);
  const showError = (message, duration) => showNotification(message, 'error', duration);
  const showWarning = (message, duration) => showNotification(message, 'warning', duration);
  const showInfo = (message, duration) => showNotification(message, 'info', duration);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};