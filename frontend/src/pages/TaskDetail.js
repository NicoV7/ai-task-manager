import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tasksAPI } from '../services/api';
import { Edit, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 8px 12px;
  
  &:hover {
    color: var(--color-text);
    background: var(--color-surface-hover);
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  flex: 1;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const TaskCard = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 30px;
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInScale 0.4s ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
`;

const StatusBadge = styled.span`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  transition: all 0.3s ease;
  animation: fadeIn 0.4s ease-out;
  
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
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  transition: all 0.3s ease;
  animation: fadeIn 0.4s ease-out 0.1s both;
  
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

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Description = styled.div`
  margin: 20px 0;
  line-height: 1.6;
  color: #374151;
`;

const AISection = styled.div`
  background: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
`;

const AITitle = styled.h3`
  margin: 0 0 15px 0;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
`;

const AIInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  resize: vertical;
  min-height: 100px;
  background-color: var(--color-surface);
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

const AIResponse = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 20px;
  margin-top: 15px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text);
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  
  ${props => props.isError && `
    background: var(--color-error-bg);
    border-color: var(--color-error);
    color: var(--color-error);
  `}
`;

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const { data: task, isLoading } = useQuery(
    ['task', id],
    () => tasksAPI.getTask(id).then(res => res.data)
  );

  const deleteMutation = useMutation(
    () => tasksAPI.deleteTask(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        navigate('/tasks');
      }
    }
  );

  const aiSuggestionMutation = useMutation(
    (message) => tasksAPI.getAISuggestion(id, message),
    {
      onSuccess: (data) => {
        setAiResponse(data.data.ai_response);
        setAiMessage(''); // Clear the input after successful submission
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to get AI suggestion. Please try again.';
        setAiResponse(`Error: ${errorMessage}`);
      }
    }
  );

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate();
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      aiSuggestionMutation.mutate(aiMessage.trim());
    }
  };

  if (isLoading) {
    return <div>Loading task...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="animate-fade-in">
      <Header className="animate-slide-up">
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <Title>{task.title}</Title>
        <Actions>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            <Edit size={16} />
            Edit
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </Actions>
      </Header>

      <TaskCard>
        <TaskMeta>
          <StatusBadge status={task.status}>{task.status}</StatusBadge>
          <PriorityBadge priority={task.priority}>{task.priority}</PriorityBadge>
        </TaskMeta>

        <Description>
          {task.description || <em>No description provided</em>}
        </Description>

        <div>
          <strong>Created:</strong> {new Date(task.created_at).toLocaleString()}
        </div>
        {task.due_date && (
          <div>
            <strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}
          </div>
        )}
        {task.updated_at !== task.created_at && (
          <div>
            <strong>Updated:</strong> {new Date(task.updated_at).toLocaleString()}
          </div>
        )}
      </TaskCard>

      <AISection>
        <AITitle>
          <MessageCircle size={20} />
          AI Assistant
        </AITitle>
        <form onSubmit={handleAISubmit}>
          <AIInput
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="Ask the AI assistant for help with this task..."
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={aiSuggestionMutation.isLoading || !aiMessage.trim()}
            style={{ marginTop: '10px' }}
          >
            {aiSuggestionMutation.isLoading ? 'Getting AI Response...' : 'Ask AI'}
          </button>
        </form>

        {aiResponse && (
          <AIResponse isError={aiResponse.startsWith('Error:')}>
            {aiResponse}
          </AIResponse>
        )}
      </AISection>
    </div>
  );
}

export default TaskDetail;