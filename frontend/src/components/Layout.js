import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, CheckSquare, Plus, LogOut } from 'lucide-react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.nav`
  width: 250px;
  background: #1a202c;
  color: white;
  padding: 20px;
`;

const Logo = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #3182ce;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 10px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: #cbd5e0;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover, &.active {
    background: #2d3748;
    color: white;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background: #2d3748;
    color: white;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background: #f8fafc;
`;

const UserInfo = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #2d3748;
  font-size: 14px;
  color: #a0aec0;
`;

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>AI Task Manager</Logo>
        <NavList>
          <NavItem>
            <NavLink 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              to="/tasks" 
              className={isActive('/tasks') ? 'active' : ''}
            >
              <CheckSquare size={18} />
              Tasks
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              to="/tasks/new"
              className={isActive('/tasks/new') ? 'active' : ''}
            >
              <Plus size={18} />
              New Task
            </NavLink>
          </NavItem>
        </NavList>
        <UserInfo>
          Logged in as: {user?.username}
        </UserInfo>
        <LogoutButton onClick={logout}>
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