import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const aiApi = axios.create({
  baseURL: `${API_BASE_URL}/api/ai`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Claude Settings Service (Simplified)
export const claudeSettingsService = {
  // Get user's Claude settings
  getSettings: async () => {
    const response = await aiApi.get('/settings/');
    return response.data;
  },

  // Update user's Claude settings
  updateSettings: async (settings) => {
    const response = await aiApi.post('/settings/', settings);
    return response.data;
  },

  // Test Claude API key connection
  testConnection: async (apiKey = null) => {
    const payload = {};
    if (apiKey) {
      payload.api_key = apiKey;
    }

    const response = await aiApi.post('/test-connection/', payload);
    return response.data;
  },
};

// Claude Chat Service (Simplified)
export const claudeChatService = {
  // Generate Claude AI response
  generateResponse: async (messages) => {
    const response = await aiApi.post('/chat/', { messages });
    return response.data;
  },
};

// Claude Utility functions
export const claudeUtils = {
  // Validate Claude API key format
  validateApiKey: (apiKey) => {
    if (!apiKey) return false;
    return apiKey.match(/^sk-ant-api03-[A-Za-z0-9_-]+$/);
  },

  // Format Claude model name for display
  formatModelName: (model) => {
    const modelNames = {
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
      'claude-3-opus-20240229': 'Claude 3 Opus',
    };
    return modelNames[model] || model;
  },

  // Estimate token count (rough estimation)
  estimateTokens: (text) => {
    if (!text) return 0;
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  },

  // Format usage statistics
  formatUsage: (usage) => {
    if (!usage) return null;

    return {
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
    };
  },
};

// Error handling wrapper
export const withErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('AI Service Error:', error);
      
      if (error.response) {
        // API error response
        const { status, data } = error.response;
        throw new Error(data.error || `API Error: ${status}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  };
};

// Export simplified Claude services with error handling
export default {
  settings: Object.fromEntries(
    Object.entries(claudeSettingsService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  chat: Object.fromEntries(
    Object.entries(claudeChatService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  utils: claudeUtils,
};