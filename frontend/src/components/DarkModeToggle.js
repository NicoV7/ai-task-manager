import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styled from 'styled-components';

const ToggleButton = styled.button`
  position: relative;
  width: 48px;
  height: 26px;
  background-color: ${props => props.isDark ? 'var(--color-primary)' : 'var(--color-secondary)'};
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 2px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);

  &:hover {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 8px rgba(49, 130, 206, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const ToggleSlider = styled.div`
  position: absolute;
  top: 2px;
  left: ${props => props.isDark ? '24px' : '2px'};
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const IconWrapper = styled.div`
  color: ${props => props.isDark ? '#fbbf24' : '#f59e0b'};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${props => props.isDark ? 'rotate(0deg)' : 'rotate(180deg)'};
  transition: transform 0.3s ease, color 0.3s ease;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
  user-select: none;
`;

function DarkModeToggle({ showLabel = false, size = 'default' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const sizeProps = size === 'small' 
    ? { width: '40px', height: '22px', sliderSize: '18px' }
    : { width: '48px', height: '26px', sliderSize: '22px' };

  return (
    <ToggleContainer>
      {showLabel && (
        <Label>
          {isDarkMode ? 'Dark' : 'Light'}
        </Label>
      )}
      <ToggleButton
        onClick={handleToggle}
        isDark={isDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        style={size === 'small' ? { width: sizeProps.width, height: sizeProps.height } : {}}
      >
        <ToggleSlider 
          isDark={isDarkMode}
          style={size === 'small' ? { 
            width: sizeProps.sliderSize, 
            height: sizeProps.sliderSize,
            left: isDarkMode ? '20px' : '2px'
          } : {}}
        >
          <IconWrapper isDark={isDarkMode}>
            {isDarkMode ? (
              <Moon size={size === 'small' ? 10 : 12} />
            ) : (
              <Sun size={size === 'small' ? 10 : 12} />
            )}
          </IconWrapper>
        </ToggleSlider>
      </ToggleButton>
    </ToggleContainer>
  );
}

export default DarkModeToggle;