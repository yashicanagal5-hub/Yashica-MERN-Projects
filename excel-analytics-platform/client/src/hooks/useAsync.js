import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  const execute = useCallback(async (asyncFunction, showErrorNotification = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('⚡ Async function started');
      const result = await asyncFunction();
      console.log('✅ Async function completed successfully');
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      console.error('❌ Async function failed:', errorMessage);
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 Async function finished (loading set to false)');
    }
  }, [showError]);

  // TODO: Add retry mechanism for failed requests
  // TODO: Add timeout functionality
  // TODO: Add loading state persistence
  // TODO: Add performance monitoring

  return {
    loading,
    error,
    execute,
    clearError: () => {
      setError(null);
      console.log('🧹 Error cleared');
    },
  };
};