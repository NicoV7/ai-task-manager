import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { Plus, Search, Filter } from 'lucide-react';
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
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 300px;
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
`;

const TaskGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const TaskCard = styled(Link)`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #3182ce;
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
  color: #1a202c;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 12px;
  
  ${props => {
    switch (props.status) {
      case 'todo':
        return 'background: #e2e8f0; color: #4a5568;';
      case 'in_progress':
        return 'background: #fef3c7; color: #d69e2e;';
      case 'completed':
        return 'background: #dcfce7; color: #16a34a;';
      default:
        return 'background: #e2e8f0; color: #4a5568;';
    }
  }}
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  
  ${props => {
    switch (props.priority) {
      case 'urgent':
        return 'background: #fecaca; color: #dc2626;';
      case 'high':
        return 'background: #fed7aa; color: #ea580c;';
      case 'medium':
        return 'background: #fef3c7; color: #d69e2e;';
      case 'low':
        return 'background: #dcfce7; color: #16a34a;';
      default:
        return 'background: #e2e8f0; color: #4a5568;';
    }
  }}
`;

const TaskDescription = styled.p`
  margin: 0 0 16px 0;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
`;

function TaskList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: tasks = [], isLoading } = useQuery('tasks', () =>
    tasksAPI.getTasks().then(res => res.data)
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <Header>
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
        <TaskGrid>
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