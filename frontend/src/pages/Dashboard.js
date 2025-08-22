import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { extractTasksFromResponse, filterTasksByStatus, filterTasksByPriority } from '../utils/tasks';
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react';
import styled from 'styled-components';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: var(--color-surface);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: fadeInScale 0.4s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.bg || 'var(--color-secondary)'};
  color: ${props => props.color || 'var(--color-text-secondary)'};
  transition: all 0.3s ease;
  
  ${StatCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text);
  transition: color 0.3s ease;
`;

const StatLabel = styled.div`
  color: var(--color-text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  color: var(--color-text);
  transition: color 0.3s ease;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

const TaskSection = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.4s ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
`;

const TaskSectionHeader = styled.div`
  padding: 16px 20px;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--color-text);
  transition: all 0.3s ease;
`;

const TaskList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TaskItem = styled(Link)`
  display: block;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-light);
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(49, 130, 206, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    background: var(--color-surface-hover);
    transform: translateX(4px);
    padding-left: 24px;
  }

  &:hover::before {
    left: 100%;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TaskTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  transition: color 0.3s ease;
`;

const TaskMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
  transition: color 0.3s ease;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
  animation: fadeIn 0.5s ease-out;
`;

function Dashboard() {
  const { data: tasksResponse, isLoading } = useQuery('tasks', () =>
    tasksAPI.getTasks().then(res => res.data)
  );

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  // Safely extract tasks from API response
  const tasks = extractTasksFromResponse(tasksResponse);

  const todoTasks = filterTasksByStatus(tasks, 'todo');
  const inProgressTasks = filterTasksByStatus(tasks, 'in_progress');
  const completedTasks = filterTasksByStatus(tasks, 'completed');
  const highPriorityTasks = filterTasksByPriority(tasks, ['high', 'urgent']);

  return (
    <div className="animate-fade-in">
      <h1 className="animate-slide-up">Dashboard</h1>
      
      <DashboardGrid className="stagger-children">
        <StatCard>
          <StatIcon bg="#dbeafe" color="#3b82f6">
            <CheckSquare size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{tasks.length}</StatNumber>
            <StatLabel>Total Tasks</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bg="#fef3c7" color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{inProgressTasks.length}</StatNumber>
            <StatLabel>In Progress</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bg="#dcfce7" color="#22c55e">
            <CheckSquare size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{completedTasks.length}</StatNumber>
            <StatLabel>Completed</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bg="#fecaca" color="#ef4444">
            <AlertCircle size={24} />
          </StatIcon>
          <StatInfo>
            <StatNumber>{highPriorityTasks.length}</StatNumber>
            <StatLabel>High Priority</StatLabel>
          </StatInfo>
        </StatCard>
      </DashboardGrid>

      <SectionTitle>Recent Tasks</SectionTitle>
      <TaskGrid>
        <TaskSection>
          <TaskSectionHeader>To Do ({todoTasks.length})</TaskSectionHeader>
          <TaskList>
            {todoTasks.length > 0 ? (
              todoTasks.slice(0, 5).map(task => (
                <TaskItem key={task.id} to={`/tasks/${task.id}`}>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskMeta>Priority: {task.priority}</TaskMeta>
                </TaskItem>
              ))
            ) : (
              <EmptyState>No tasks to do</EmptyState>
            )}
          </TaskList>
        </TaskSection>

        <TaskSection>
          <TaskSectionHeader>In Progress ({inProgressTasks.length})</TaskSectionHeader>
          <TaskList>
            {inProgressTasks.length > 0 ? (
              inProgressTasks.slice(0, 5).map(task => (
                <TaskItem key={task.id} to={`/tasks/${task.id}`}>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskMeta>Priority: {task.priority}</TaskMeta>
                </TaskItem>
              ))
            ) : (
              <EmptyState>No tasks in progress</EmptyState>
            )}
          </TaskList>
        </TaskSection>
      </TaskGrid>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/tasks/new" className="btn btn-primary">
          <Plus size={18} />
          Create New Task
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;