import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckSquare, Clock, AlertCircle, Trash2 } from 'lucide-react';
import styled from 'styled-components';

const HierarchyContainer = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 20px;
  margin: 20px 0;
`;

const HierarchyTitle = styled.h3`
  margin: 0 0 15px 0;
  color: var(--color-text);
  font-size: 18px;
  font-weight: 600;
`;

const TaskNode = styled.div`
  margin-left: ${props => props.level * 20}px;
  margin-bottom: 8px;
  border-left: ${props => props.level > 0 ? '2px solid var(--color-border-light)' : 'none'};
  padding-left: ${props => props.level > 0 ? '15px' : '0'};
  transition: all 0.3s ease;
`;

const TaskNodeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.isCurrentTask ? 'var(--color-primary-light)' : 'var(--color-background)'};
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-primary);
    transform: translateX(2px);
  }
  
  ${props => props.isCurrentTask && `
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
  `}
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled(Link)`
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  display: block;
  margin-bottom: 4px;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--color-primary);
  }
  
  ${props => props.$completed && `
    text-decoration: line-through;
    opacity: 0.7;
  `}
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
`;

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
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
`;

const PriorityBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  
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
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${TaskNodeHeader}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
  
  &:hover.delete {
    color: var(--color-error);
  }
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckSquare size={12} />;
    case 'in_progress':
      return <Clock size={12} />;
    default:
      return <AlertCircle size={12} />;
  }
};

const TaskHierarchyNode = ({ 
  task, 
  currentTaskId, 
  level = 0, 
  onDeleteSubtask,
  expanded = true,
  onToggleExpand 
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isCurrentTask = task.id === currentTaskId;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    onToggleExpand?.(task.id, !isExpanded);
  };

  const handleDeleteSubtask = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDeleteSubtask(task.id);
    }
  };

  return (
    <TaskNode level={level}>
      <TaskNodeHeader isCurrentTask={isCurrentTask}>
        <ExpandButton
          onClick={handleToggleExpand}
          disabled={!hasSubtasks}
        >
          {hasSubtasks ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <div style={{ width: 16, height: 16 }} />
          )}
        </ExpandButton>
        
        <TaskInfo>
          <TaskTitle 
            to={`/tasks/${task.id}`}
            $completed={task.status === 'completed'}
          >
            {task.title}
          </TaskTitle>
          <TaskMeta>
            <StatusBadge status={task.status}>
              {getStatusIcon(task.status)}
              {task.status.replace('_', ' ')}
            </StatusBadge>
            <PriorityBadge priority={task.priority}>
              {task.priority}
            </PriorityBadge>
            {task.progress > 0 && (
              <span>{task.progress}%</span>
            )}
          </TaskMeta>
        </TaskInfo>
        
        <ActionButtons>
          {level > 0 && onDeleteSubtask && (
            <ActionButton 
              className="delete"
              onClick={handleDeleteSubtask}
              title="Delete subtask"
            >
              <Trash2 size={14} />
            </ActionButton>
          )}
        </ActionButtons>
      </TaskNodeHeader>
      
      {hasSubtasks && isExpanded && (
        <div>
          {task.subtasks.map(subtask => (
            <TaskHierarchyNode
              key={subtask.id}
              task={subtask}
              currentTaskId={currentTaskId}
              level={level + 1}
              onDeleteSubtask={onDeleteSubtask}
              expanded={false}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </TaskNode>
  );
};

const TaskHierarchy = ({ task, onDeleteSubtask }) => {
  if (!task) return null;

  // Find the root task of the hierarchy
  const rootTask = task.parent_task ? 
    { ...task, subtasks: [] } : // If this is a subtask, we'll show a simplified view
    task;

  return (
    <HierarchyContainer>
      <HierarchyTitle>
        {task.parent_task ? 'Task Hierarchy' : 'Task Breakdown'}
      </HierarchyTitle>
      
      {task.parent_task && (
        <div style={{ marginBottom: '15px' }}>
          <TaskTitle to={`/tasks/${task.parent_task}`}>
            ← Back to parent: {task.parent_task_title}
          </TaskTitle>
        </div>
      )}
      
      <TaskHierarchyNode
        task={rootTask}
        currentTaskId={task.id}
        onDeleteSubtask={onDeleteSubtask}
        expanded={true}
      />
      
      {(!task.subtasks || task.subtasks.length === 0) && !task.parent_task && (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--color-text-muted)', 
          fontStyle: 'italic',
          padding: '20px 0'
        }}>
          No subtasks yet. Break down this task to get started!
        </div>
      )}
    </HierarchyContainer>
  );
};

export default TaskHierarchy;