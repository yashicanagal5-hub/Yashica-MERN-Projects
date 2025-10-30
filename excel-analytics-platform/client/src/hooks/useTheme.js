import { useState, useEffect } from 'react';

const THEME_KEY = 'excel-analytics-theme';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      console.log('🎨 Theme loaded from localStorage:', savedTheme);
      return savedTheme === 'dark';
    }
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('🖥️  Using system theme preference:', systemPrefersDark ? 'dark' : 'light');
    return systemPrefersDark;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    console.log('💾 Theme saved to localStorage:', darkMode ? 'dark' : 'light');
    
    // Add class to document for global styles
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        setDarkMode(e.matches);
        console.log('🔄 Auto-switching to system theme:', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
    console.log('🔄 Theme toggled:', !darkMode ? 'dark' : 'light');
  };

  // TODO: Add transition animations for theme change
  // TODO: Add theme-specific color palettes
  // TODO: Add custom theme editor

  return {
    darkMode,
    toggleTheme,
  };
};