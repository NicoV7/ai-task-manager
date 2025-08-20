import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { tasksAPI, tagsAPI } from '../services/api';
import { ArrowLeft, Plus } from 'lucide-react';
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
  margin: 0;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-bottom: 20px;
  padding: 12px;
  background: #fed7d7;
  border-radius: 6px;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

function CreateTask() {
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

  const { data: tags = [] } = useQuery('tags', () =>
    tagsAPI.getTags().then(res => res.data)
  );

  const createMutation = useMutation(
    (taskData) => tasksAPI.createTask(taskData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('tasks');
        navigate(`/tasks/${data.data.id}`);
      },
      onError: (error) => {
        setError(error.response?.data?.detail || 'Failed to create task');
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

    createMutation.mutate(taskData);
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

  return (
    <div>
      <Header>
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <Title>Create New Task</Title>
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
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
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
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Task'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
          </Actions>
        </Form>
      </FormCard>
    </div>
  );
}

export default CreateTask;