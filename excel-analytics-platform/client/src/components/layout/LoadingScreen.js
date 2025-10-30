import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => {
  console.log('⏳ Loading screen shown with message:', message);
  
  // TODO: Add skeleton loaders for different content types
  // TODO: Add progress bars for file uploads
  // TODO: Add different loading animations (spinner, dots, pulse, etc.)
  // TODO: Add loading state for specific components (charts, tables, etc.)

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: 4,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CircularProgress size={48} thickness={4} />
          <Typography
            variant="h6"
            sx={{
              color: 'grey.700',
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
};

export default LoadingScreen;