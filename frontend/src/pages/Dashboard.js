import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react';
import styled from 'styled-components';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.bg || '#e2e8f0'};
  color: ${props => props.color || '#4a5568'};
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1a202c;
`;

const StatLabel = styled.div`
  color: #4a5568;
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  color: #1a202c;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

const TaskSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TaskSectionHeader = styled.div`
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #1a202c;
`;

const TaskList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TaskItem = styled(Link)`
  display: block;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  text-decoration: none;
  color: #1a202c;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TaskTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const TaskMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
`;

function Dashboard() {
  const { data: tasks = [], isLoading } = useQuery('tasks', () =>
    tasksAPI.getTasks().then(res => res.data)
  );

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');

  return (
    <div>
      <h1>Dashboard</h1>
      
      <DashboardGrid>
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