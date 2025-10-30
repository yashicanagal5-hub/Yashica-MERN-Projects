import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';

// Layout Components
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import FileDetails from './pages/FileDetails';
import Analytics from './pages/Analytics';
import AnalysisDetails from './pages/AnalysisDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFiles from './pages/admin/AdminFiles';
import AdminAnalyses from './pages/admin/AdminAnalyses';

// TODO: Add error handling for failed page imports
// import ErrorPage from './pages/ErrorPage';

console.log('🚀 App.js: Main App component initializing');

/**
 * Protected Route Component
 * TODO: Add role-based access control with more granular permissions
 * TODO: Add route-specific loading states
 * @param {React.ReactNode} children - Protected component
 * @param {boolean} requireAdmin - Whether admin access is required
 * @returns {React.ReactNode} Protected component or redirect
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  console.log(`🛡️ App.js: ProtectedRoute checking access - requireAdmin: ${requireAdmin}, user: ${user?.email || 'none'}, loading: ${loading}`);

  if (loading) {
    console.log('⏳ App.js: ProtectedRoute - showing loading screen while auth state loads');
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('❌ App.js: ProtectedRoute - no user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('⚠️ App.js: ProtectedRoute - user is not admin, redirecting to dashboard');
    console.log(`🔍 App.js: User role check - current: ${user.role}, required: admin`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log(`✅ App.js: ProtectedRoute - access granted for ${requireAdmin ? 'admin' : 'regular'} route`);
  return children;
};

/**
 * Public Route Component (redirect if already logged in)
 * TODO: Add return URL parameter for post-login redirect
 * @param {React.ReactNode} children - Public component
 * @returns {React.ReactNode} Public component or redirect to dashboard
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log(`🌐 App.js: PublicRoute checking state - user: ${user?.email || 'none'}, loading: ${loading}`);

  if (loading) {
    console.log('⏳ App.js: PublicRoute - showing loading screen while auth state loads');
    return <LoadingScreen />;
  }

  if (user) {
    console.log('✅ App.js: PublicRoute - user already logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ App.js: PublicRoute - no user, allowing access to public route');
  return children;
};

function App() {
  console.log('🎨 App.js: Initializing with theme context');
  
  const { darkMode } = useTheme();

  console.log(`🌓 App.js: Theme mode: ${darkMode ? 'dark' : 'light'}`);

  // TODO: Add performance monitoring for route changes
  // console.log('App.js: Route render performance tracking:', performance.now());

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkMode ? 'grey.900' : 'grey.50',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Routes>
        {/* TODO: Add more public routes (forgot password, reset password, etc.) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* TODO: Add route change analytics tracking */}
                  <Route 
                    path="/" 
                    element={
                      <Navigate to="/dashboard" replace />
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <Dashboard />
                    } 
                  />
                  <Route 
                    path="/files" 
                    element={
                      <Files />
                    } 
                  />
                  <Route 
                    path="/files/:fileId" 
                    element={
                      <FileDetails />
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <Analytics />
                    } 
                  />
                  <Route 
                    path="/analytics/:analysisId" 
                    element={
                      <AnalysisDetails />
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <Profile />
                    } 
                  />

                  {/* Admin Routes */}
                  {/* TODO: Add admin route group with common wrapper */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/files"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminFiles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analyses"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminAnalyses />
                      </ProtectedRoute>
                    }
                  />

                  {/* TODO: Add more admin routes
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  */}

                  {/* 404 Route */}
                  {/* TODO: Add proper 404 page */}
                  <Route 
                    path="*" 
                    element={
                      <Navigate to="/dashboard" replace />
                    } 
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* TODO: Add global error boundary
      <GlobalErrorHandler>
        <ErrorFallback />
      </GlobalErrorHandler>
      */}

      {/* TODO: Add development tools for routing */}
      {/* {process.env.NODE_ENV === 'development' && (
        <RouterDebugger />
      )} */}
    </Box>
  );
}

// TODO: Add route change analytics
// const useRouteTracking = () => {
//   useEffect(() => {
//     console.log('App.js: Route changed to:', window.location.pathname);
//     // TODO: Send analytics event
//   }, [location.pathname]);
// };

// TODO: Add route preloading for better performance
// const useRoutePreloading = () => {
//   useEffect(() => {
//     // Preload critical routes
//     import('./pages/Dashboard');
//     import('./pages/Files');
//   }, []);
// };

// TODO: Add error boundary for route errors
// class RouteErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }
//
//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }
//
//   componentDidCatch(error, errorInfo) {
//     console.error('App.js: Route error caught:', error, errorInfo);
//   }
//
//   render() {
//     if (this.state.hasError) {
//       return <ErrorPage error={this.state.error} />;
//     }
//
//     return this.props.children;
//   }
// }

console.log('✅ App.js: Main App component loaded successfully');

export default App;

// TODO: Add export for route configuration (useful for testing)
// export const routeConfig = {
//   public: ['/login', '/register'],
//   protected: ['/dashboard', '/files', '/files/:fileId', '/analytics', '/analytics/:analysisId', '/profile'],
//   admin: ['/admin/dashboard', '/admin/users', '/admin/files', '/admin/analyses']
// };

// TODO: Add route constants
// export const ROUTES = {
//   HOME: '/',
//   LOGIN: '/login',
//   REGISTER: '/register',
//   DASHBOARD: '/dashboard',
//   FILES: '/files',
//   FILE_DETAILS: '/files/:fileId',
//   ANALYTICS: '/analytics',
//   ANALYSIS_DETAILS: '/analytics/:analysisId',
//   PROFILE: '/profile',
//   ADMIN_DASHBOARD: '/admin/dashboard',
//   ADMIN_USERS: '/admin/users',
//   ADMIN_FILES: '/admin/files',
//   ADMIN_ANALYSES: '/admin/analyses'
// };