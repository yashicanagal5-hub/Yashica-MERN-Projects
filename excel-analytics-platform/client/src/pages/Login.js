// TODO: Add social login options (Google, GitHub, etc.)
// TODO: Implement "Remember Me" functionality
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

console.log('Login component loaded...');

const Login = () => {
  // TODO: Add password reset functionality
  // TODO: Implement account lockout after failed attempts
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  console.log('Login component mounted');
  console.log('Form loading state:', loading);
  console.log('Form error state:', error ? error : 'none');

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      console.log('Clearing previous error');
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email: formData.email, password: '***' });
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      console.log('Login successful!');
      showSuccess('Login successful! Welcome back.');
      navigate('/dashboard');
      // TODO: Add analytics tracking for successful logins
    } else {
      console.log('Login failed:', result.error);
      // TODO: Add retry counter and account lockout logic
    }
  };

  const togglePasswordVisibility = () => {
    console.log('Password visibility toggled');
    setShowPassword(!showPassword);
  };

  // DEBUG: Login component rendered
  console.log('Rendering login form...');
  
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      {/* TODO: Add background particles or animations */}
      {/* TODO: Implement responsive design improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your Yashica -Excel Analytics Platform account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
              /* TODO: Add email validation on blur */
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              /* TODO: Add password strength indicator */
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                mb: 3,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  {/* TODO: Add loading text */}
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => console.log('Navigating to registration page')}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;