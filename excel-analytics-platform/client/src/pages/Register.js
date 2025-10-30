// TODO: Add social registration options (Google, GitHub, etc.)
// TODO: Implement email verification flow
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

console.log('Register component loaded...');

const Register = () => {
  // TODO: Add password strength meter
  // TODO: Implement account activation workflow
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  console.log('Register component mounted');
  console.log('Form loading state:', loading);
  console.log('Form error state:', error ? error : 'none');
  console.log('Current form data:', { ...formData, password: '***', confirmPassword: '***' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation errors
    if (validationErrors[name]) {
      console.log('Clearing validation error for:', name);
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      console.log('Clearing previous error');
      clearError();
    }
  };

  const validateForm = () => {
    console.log('Validating form data...');
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    // TODO: Add more name validation (no special characters, proper casing, etc.)
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    // TODO: Add email domain whitelist/blacklist checks
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    // TODO: Add password strength scoring and suggestions
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }
    // TODO: Add privacy policy agreement
    
    console.log('Validation errors found:', errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Registration attempt started');
    
    if (!validateForm()) {
      console.log('Form validation failed, stopping submission');
      return;
    }
    
    const { confirmPassword, ...userData } = formData;
    console.log('Submitting registration data:', { ...userData, email: userData.email });
    const result = await register(userData);
    
    if (result.success) {
      console.log('Registration successful!');
      showSuccess('Registration successful! Welcome to Yashica -Excel Analytics Platform.');
      navigate('/dashboard');
      // TODO: Add analytics tracking for successful registrations
    } else {
      console.log('Registration failed:', result.error);
      // TODO: Add retry counter and rate limiting
    }
  };

  // DEBUG: Register component rendered
  console.log('Rendering registration form...');
  
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
      {/* TODO: Implement progressive form with stepper */}
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Yashica -Excel Analytics Platform and start analyzing your data
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              error={!!validationErrors.email}
              helperText={validationErrors.email}
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
              autoComplete="new-password"
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        console.log('Password visibility toggled');
                        setShowPassword(!showPassword);
                      }}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        console.log('Confirm password visibility toggled');
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => {
                    console.log('Terms agreement changed:', e.target.checked);
                    setAgreeToTerms(e.target.checked);
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the{' '}
                  <Link href="#" color="primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" color="primary">
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            {validationErrors.terms && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {validationErrors.terms}
              </Alert>
            )}

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
                'Create Account'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => console.log('Navigating to login page')}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Register;