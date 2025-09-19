import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from './ThemeSelector';
import { LayoutDashboard, CheckSquare, Plus, LogOut, Settings } from 'lucide-react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const getSidebarBackground = (theme) => {
  if (theme.isNightMode) return '#000000';
  if (theme.isDarkMode) return '#1f2937';
  return '#1a202c';
};

const getSidebarBorder = (theme) => {
  if (theme.isNightMode) return '#333333';
  if (theme.isDarkMode) return '#374151';
  return '#2d3748';
};

const Sidebar = styled.nav`
  width: 250px;
  background: ${props => getSidebarBackground(props.theme)};
  color: white;
  padding: 20px;
  transition: background-color 0.3s ease;
  border-right: 1px solid ${props => getSidebarBorder(props.theme)};
`;

const Logo = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: ${props => props.theme.colors.primary};
  transition: color 0.3s ease;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 10px;
`;

const getNavLinkColor = (theme) => {
  if (theme.isNightMode) return '#ffffff';
  if (theme.isDarkMode) return '#d1d5db';
  return '#cbd5e0';
};

const getNavLinkHoverBg = (theme) => {
  if (theme.isNightMode) return '#333333';
  if (theme.isDarkMode) return '#374151';
  return '#2d3748';
};

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: ${props => getNavLinkColor(props.theme)};
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover, &.active {
    background: ${props => getNavLinkHoverBg(props.theme)};
    color: ${props => props.theme.isNightMode ? '#f97316' : 'white'};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: none;
  border: none;
  color: ${props => getNavLinkColor(props.theme)};
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background: ${props => getNavLinkHoverBg(props.theme)};
    color: ${props => props.theme.isNightMode ? '#f97316' : 'white'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background: var(--color-background);
  transition: background-color 0.3s ease;
`;

const getUserInfoColor = (theme) => {
  if (theme.isNightMode) return '#cccccc';
  if (theme.isDarkMode) return '#9ca3af';
  return '#a0aec0';
};

const UserInfo = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid ${props => getSidebarBorder(props.theme)};
  font-size: 14px;
  color: ${props => getUserInfoColor(props.theme)};
  transition: color 0.3s ease, border-color 0.3s ease;
`;

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Layout() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <LayoutContainer>
      <Sidebar theme={theme}>
        <SidebarHeader>
          <HeaderTop>
            <Logo theme={theme}>AI Task Manager</Logo>
          </HeaderTop>
          <ToggleWrapper>
            <ThemeSelector />
          </ToggleWrapper>
        </SidebarHeader>
        <NavList>
          <NavItem>
            <NavLink 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
              theme={theme}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              to="/tasks" 
              className={isActive('/tasks') ? 'active' : ''}
              theme={theme}
            >
              <CheckSquare size={18} />
              Tasks
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              to="/tasks/new"
              className={isActive('/tasks/new') ? 'active' : ''}
              theme={theme}
            >
              <Plus size={18} />
              New Task
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              to="/ai-settings"
              className={isActive('/ai-settings') ? 'active' : ''}
              theme={theme}
            >
              <Settings size={18} />
              AI Settings
            </NavLink>
          </NavItem>
        </NavList>
        <UserInfo theme={theme}>
          Logged in as: {user?.username}
        </UserInfo>
        <LogoutButton onClick={logout} theme={theme}>
          <LogOut size={18} />
          Logout
        </LogoutButton>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export default Layout;