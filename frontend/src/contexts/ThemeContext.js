import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'ai-task-manager-theme';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Check system preference if no saved preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    // Default to light mode
    return false;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document root
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    // Theme state
    isDarkMode,
    toggleTheme,
    
    // Color values for JavaScript usage
    colors: {
      primary: isDarkMode ? '#60a5fa' : '#3182ce',
      primaryHover: isDarkMode ? '#3b82f6' : '#2c5aa0',
      secondary: isDarkMode ? '#374151' : '#e2e8f0',
      secondaryHover: isDarkMode ? '#4b5563' : '#cbd5e0',
      
      background: isDarkMode ? '#111827' : '#f8fafc',
      surface: isDarkMode ? '#1f2937' : '#ffffff',
      surfaceHover: isDarkMode ? '#374151' : '#f8fafc',
      
      text: isDarkMode ? '#f9fafb' : '#1a202c',
      textSecondary: isDarkMode ? '#d1d5db' : '#4a5568',
      textMuted: isDarkMode ? '#9ca3af' : '#6b7280',
      
      border: isDarkMode ? '#374151' : '#e2e8f0',
      borderLight: isDarkMode ? '#4b5563' : '#f1f5f9',
      
      success: isDarkMode ? '#34d399' : '#16a34a',
      successBg: isDarkMode ? '#064e3b' : '#dcfce7',
      warning: isDarkMode ? '#fbbf24' : '#d69e2e',
      warningBg: isDarkMode ? '#78350f' : '#fef3c7',
      error: isDarkMode ? '#f87171' : '#dc2626',
      errorBg: isDarkMode ? '#7f1d1d' : '#fecaca',
      
      shadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      shadowHover: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};