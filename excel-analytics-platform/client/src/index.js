import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';

// TODO: Add error boundary for better error handling
// import ErrorBoundary from './components/common/ErrorBoundary';

console.log('🚀 index.js: Starting application initialization');
console.log('🔧 index.js: Initializing React Query client with custom configuration');

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

console.log('✅ index.js: React Query client created successfully');

// TODO: Add query client error handling
// queryClient.setDefaultOptions({
//   queries: {
//     retry: (failureCount, error) => {
//       console.log('index.js: Query failed, retry attempt:', failureCount, error.message);
//       return failureCount < 2 && !error?.status?.includes(400);
//     },
//   },
// });

console.log('🎨 index.js: Creating Material-UI theme with custom configuration');

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

// TODO: Add theme mode detection and persistence
// const initializeTheme = async () => {
//   const savedTheme = localStorage.getItem('theme');
//   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//   console.log('index.js: Theme preference detected:', savedTheme || systemPrefersDark ? 'dark' : 'light');
//   // TODO: Implement theme persistence logic
// };

console.log('✅ index.js: Material-UI theme configuration completed');
console.log('🌱 index.js: Setting up React DOM root for mounting');

const root = ReactDOM.createRoot(document.getElementById('root'));

// TODO: Add root element validation
// const rootElement = document.getElementById('root');
// if (!rootElement) {
//   throw new Error('index.js: Root element not found! Make sure you have <div id="root"></div> in your HTML');
// }

console.log('🎯 index.js: Rendering application with provider stack');

// TODO: Add performance monitoring
// console.log('index.js: Initial load performance:', performance.now());

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <NotificationProvider>
              {/* TODO: Wrap with error boundary for better error handling */}
              {/* <ErrorBoundary> */}
                <App />
              {/* </ErrorBoundary> */}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

console.log('🎉 index.js: Application rendering completed successfully');

// TODO: Add service worker registration for offline functionality
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('index.js: Service Worker registered successfully:', registration);
//       })
//       .catch(error => {
//         console.log('index.js: Service Worker registration failed:', error);
//       });
//   });
// }

// TODO: Add development tools initialization
// if (process.env.NODE_ENV === 'development') {
//   console.log('index.js: Development mode enabled - initializing debug tools');
//   // TODO: Initialize React DevTools, Redux DevTools, etc.
// }

// TODO: Add performance tracking for web vitals
// import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// getCLS(console.log);
// getFID(console.log);
// getFCP(console.log);
// getLCP(console.log);
// getTTFB(console.log);

console.log('🚀 index.js: All initialization complete - app should be running now');