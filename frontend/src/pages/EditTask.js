import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { tasksAPI, tagsAPI } from '../services/api';
import { extractTagsFromResponse } from '../utils/tasks';
import { ArrowLeft } from 'lucide-react';
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
  margin: 0;
`;

const FormCard = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 30px;
  transition: all 0.3s ease;
  animation: fadeInScale 0.4s ease-out;
`;

const Form = styled.form`
  max-width: 600px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  font-size: 14px;
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

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-error);
  margin-bottom: 20px;
  padding: 12px;
  background: var(--color-error-bg);
  border-radius: 6px;
  font-size: 14px;
  animation: slideInDown 0.3s ease-out;
`;

const Actions = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    tag_ids: []
  });
  const [error, setError] = useState('');

  // Fetch task data
  const { data: task, isLoading: taskLoading } = useQuery(
    ['task', id],
    () => tasksAPI.getTask(id).then(res => res.data),
    {
      onSuccess: (taskData) => {
        // Format due_date for datetime-local input
        const formattedDueDate = taskData.due_date 
          ? new Date(taskData.due_date).toISOString().slice(0, 16)
          : '';
        
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          due_date: formattedDueDate,
          tag_ids: taskData.tags ? taskData.tags.map(tag => tag.id) : []
        });
      }
    }
  );

  // Fetch tags
  const { data: tagsResponse } = useQuery('tags', () =>
    tagsAPI.getTags().then(res => res.data)
  );

  // Safely extract tags from API response
  const tags = extractTagsFromResponse(tagsResponse);

  const updateMutation = useMutation(
    (taskData) => tasksAPI.updateTask(id, taskData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries(['task', id]);
        navigate(`/tasks/${id}`);
      },
      onError: (error) => {
        setError(error.response?.data?.detail || 'Failed to update task');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    const taskData = {
      ...formData,
      due_date: formData.due_date || null,
      tag_ids: formData.tag_ids.filter(Boolean)
    };

    updateMutation.mutate(taskData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      tag_ids: value
    }));
  };

  if (taskLoading) {
    return <div>Loading task...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="animate-fade-in">
      <Header className="animate-slide-up">
        <BackButton onClick={() => navigate(`/tasks/${id}`)}>
          <ArrowLeft size={18} />
          Back to Task
        </BackButton>
        <Title>Edit Task</Title>
      </Header>

      <FormCard>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task in detail..."
            />
          </div>

          <FormRow>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <Select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </FormRow>

          <FormRow>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <Select multiple name="tag_ids" value={formData.tag_ids} onChange={handleTagChange}>
                {tags.map(tag => (
                  <option key={tag?.id || Math.random()} value={tag?.id}>
                    {tag?.name || 'Unknown Tag'}
                  </option>
                ))}
              </Select>
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Hold Ctrl/Cmd to select multiple tags
              </small>
            </div>
          </FormRow>

          <Actions>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Task'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/tasks/${id}`)}
            >
              Cancel
            </button>
          </Actions>
        </Form>
      </FormCard>
    </div>
  );
}

export default EditTask;