import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          User Management
        </Typography>
      </motion.div>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          User Management Interface
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This page will provide comprehensive user management capabilities
          including user listing, role management, account activation/deactivation,
          and user activity monitoring.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/dashboard')}
        >
          Back to Admin Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default AdminUsers;