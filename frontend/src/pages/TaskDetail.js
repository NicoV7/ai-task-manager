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
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    color: #374151;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  
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
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  
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
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const AITitle = styled.h3`
  margin: 0 0 15px 0;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AIInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  min-height: 100px;
`;

const AIResponse = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  margin-top: 10px;
  white-space: pre-wrap;
  line-height: 1.5;
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
    <div>
      <Header>
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <Title>{task.title}</Title>
        <Actions>
          <button className="btn btn-secondary">
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
          <AIResponse>
            {aiResponse}
          </AIResponse>
        )}
      </AISection>
    </div>
  );
}

export default TaskDetail;