import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { extractTasksFromResponse } from '../utils/tasks';
import { Plus } from 'lucide-react';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const Title = styled.h1`
  flex: 1;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  width: 300px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const TaskGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const TaskCard = styled(Link)`
  background: var(--color-surface);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  animation: fadeInScale 0.4s ease-out;
  transform: translateY(0);
  will-change: transform, box-shadow;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-primary);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: var(--color-text);
  flex: 1;
  transition: color 0.3s ease;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 12px;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.status) {
      case 'todo':
        return `
          background: var(--status-todo-bg);
          color: var(--status-todo-text);
        `;
      case 'in_progress':
        return `
          background: var(--status-progress-bg);
          color: var(--status-progress-text);
        `;
      case 'completed':
        return `
          background: var(--status-completed-bg);
          color: var(--status-completed-text);
        `;
      default:
        return `
          background: var(--status-todo-bg);
          color: var(--status-todo-text);
        `;
    }
  }}
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.priority) {
      case 'urgent':
        return `
          background: var(--priority-urgent-bg);
          color: var(--priority-urgent-text);
        `;
      case 'high':
        return `
          background: var(--priority-high-bg);
          color: var(--priority-high-text);
        `;
      case 'medium':
        return `
          background: var(--priority-medium-bg);
          color: var(--priority-medium-text);
        `;
      case 'low':
        return `
          background: var(--priority-low-bg);
          color: var(--priority-low-text);
        `;
      default:
        return `
          background: var(--status-todo-bg);
          color: var(--status-todo-text);
        `;
    }
  }}
  
  &:hover {
    transform: scale(1.05);
  }
`;

const TaskDescription = styled.p`
  margin: 0 0 16px 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--color-text-muted);
  transition: color 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  animation: fadeIn 0.5s ease-out;
`;

function TaskList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: tasksResponse, isLoading } = useQuery('tasks', () =>
    tasksAPI.getTasks().then(res => res.data)
  );

  // Safely extract tasks from API response
  const tasks = extractTasksFromResponse(tasksResponse);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()) ||
                         task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="animate-fade-in">
      <Header className="animate-slide-up">
        <Title>Tasks</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </FilterSelect>
          
          <FilterSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </FilterSelect>

          <Link to="/tasks/new" className="btn btn-primary">
            <Plus size={18} />
            New Task
          </Link>
        </Controls>
      </Header>

      {filteredTasks.length > 0 ? (
        <TaskGrid className="stagger-children">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} to={`/tasks/${task.id}`}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <StatusBadge status={task.status}>{task.status}</StatusBadge>
              </TaskHeader>
              
              {task.description && (
                <TaskDescription>{task.description}</TaskDescription>
              )}
              
              <TaskMeta>
                <PriorityBadge priority={task.priority}>
                  {task.priority}
                </PriorityBadge>
                Created {new Date(task.created_at).toLocaleDateString()}
                {task.due_date && (
                  <> • Due {new Date(task.due_date).toLocaleDateString()}</>
                )}
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskGrid>
      ) : (
        <EmptyState>
          <h3>No tasks found</h3>
          <p>
            {search || statusFilter || priorityFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'
            }
          </p>
          <Link to="/tasks/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <Plus size={18} />
            Create Task
          </Link>
        </EmptyState>
      )}
    </div>
  );
}

export default TaskList;