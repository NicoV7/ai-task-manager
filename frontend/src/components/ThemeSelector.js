import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledSelect = styled.select`
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 32px 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  min-width: 140px;

  &:hover {
    border-color: var(--color-primary);
    background-color: var(--color-surface-hover);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  /* Night mode specific styling */
  [data-theme="night"] & {
    background-color: #000000;
    border-color: #333333;
    color: #ffffff;

    &:hover {
      border-color: #f97316;
      background-color: #1a1a1a;
    }

    &:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
  }

  option {
    background-color: var(--color-surface);
    color: var(--color-text);
    padding: 8px;
  }

  [data-theme="night"] & option {
    background-color: #000000;
    color: #ffffff;
  }
`;

const getThemeIcon = (theme) => {
  switch (theme) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
    case 'night':
      return '🌚';
    default:
      return '☀️';
  }
};

const getThemeLabel = (theme) => {
  switch (theme) {
    case 'light':
      return 'Light Mode';
    case 'dark':
      return 'Dark Mode';
    case 'night':
      return 'Night Mode';
    default:
      return 'Light Mode';
  }
};

function ThemeSelector({ showLabel = false, position = 'static' }) {
  const { currentTheme, setTheme } = useTheme();

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const containerStyle = position === 'fixed'
    ? { position: 'fixed', top: '16px', right: '16px', zIndex: 50 }
    : {};

  return (
    <SelectorContainer style={containerStyle}>
      <StyledSelect
        value={currentTheme}
        onChange={handleThemeChange}
        aria-label="Select theme"
        title="Change theme"
      >
        <option value="light">
          {getThemeIcon('light')} {getThemeLabel('light')}
        </option>
        <option value="dark">
          {getThemeIcon('dark')} {getThemeLabel('dark')}
        </option>
        <option value="night">
          {getThemeIcon('night')} {getThemeLabel('night')}
        </option>
      </StyledSelect>
    </SelectorContainer>
  );
}

export default ThemeSelector;