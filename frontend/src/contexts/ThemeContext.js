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
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && ['light', 'dark', 'night'].includes(savedTheme)) {
      return savedTheme;
    }

    // Check system preference if no saved preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light mode
    return 'light';
  });

  const applyTheme = (theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('dark', 'night');
    root.removeAttribute('data-theme');

    // Add appropriate theme class/attribute
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'night') {
      root.classList.add('night');
      root.setAttribute('data-theme', 'night');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'night' : 'light';
    setCurrentTheme(nextTheme);
  };

  const setTheme = (theme) => {
    if (['light', 'dark', 'night'].includes(theme)) {
      setCurrentTheme(theme);
    }
  };

  const getThemeColors = (theme) => {
    const colorMap = {
      light: {
        primary: '#3182ce',
        primaryHover: '#2c5aa0',
        secondary: '#e2e8f0',
        secondaryHover: '#cbd5e0',
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceHover: '#f8fafc',
        text: '#1a202c',
        textSecondary: '#4a5568',
        textMuted: '#6b7280',
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
        success: '#16a34a',
        successBg: '#dcfce7',
        warning: '#d69e2e',
        warningBg: '#fef3c7',
        error: '#dc2626',
        errorBg: '#fecaca',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        shadowHover: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#374151',
        secondaryHover: '#4b5563',
        background: '#111827',
        surface: '#1f2937',
        surfaceHover: '#374151',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        textMuted: '#9ca3af',
        border: '#374151',
        borderLight: '#4b5563',
        success: '#34d399',
        successBg: '#064e3b',
        warning: '#fbbf24',
        warningBg: '#78350f',
        error: '#f87171',
        errorBg: '#7f1d1d',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        shadowHover: '0 4px 6px rgba(0, 0, 0, 0.4)',
      },
      night: {
        primary: '#f97316',
        primaryHover: '#ea580c',
        secondary: '#333333',
        secondaryHover: '#404040',
        background: '#000000',
        surface: '#000000',
        surfaceHover: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#ffffff',
        textMuted: '#cccccc',
        border: '#333333',
        borderLight: '#404040',
        success: '#22c55e',
        successBg: '#052e16',
        warning: '#f59e0b',
        warningBg: '#451a03',
        error: '#ef4444',
        errorBg: '#450a0a',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
        shadowHover: '0 4px 6px rgba(0, 0, 0, 0.9)',
      }
    };
    return colorMap[theme] || colorMap.light;
  };

  const theme = {
    // Theme state
    currentTheme,
    isDarkMode: currentTheme === 'dark',
    isNightMode: currentTheme === 'night',
    toggleTheme,
    setTheme,

    // Color values for JavaScript usage
    colors: getThemeColors(currentTheme)
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};