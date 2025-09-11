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

// AI Provider Service
export const aiProviderService = {
  // Get all available AI providers
  getProviders: async () => {
    const response = await aiApi.get('/providers/');
    return response.data;
  },

  // Get specific provider details
  getProvider: async (providerId) => {
    const response = await aiApi.get(`/providers/${providerId}/`);
    return response.data;
  },
};

// User AI Settings Service
export const aiSettingsService = {
  // Get user's AI settings
  getSettings: async () => {
    const response = await aiApi.get('/settings/');
    return response.data;
  },

  // Update user's AI settings
  updateSettings: async (settings) => {
    const response = await aiApi.post('/settings/', settings);
    return response.data;
  },
};

// API Key Management Service
export const apiKeyService = {
  // Get user's API key status for all providers
  getApiKeys: async () => {
    const response = await aiApi.get('/api-keys/');
    return response.data;
  },

  // Add or update API key for a provider
  saveApiKey: async (provider, apiKey) => {
    const response = await aiApi.post('/api-keys/', {
      provider,
      api_key: apiKey,
    });
    return response.data;
  },

  // Delete API key for a provider
  deleteApiKey: async (provider) => {
    const response = await aiApi.delete('/api-keys/', {
      data: { provider },
    });
    return response.data;
  },

  // Test API key connection
  testConnection: async (provider, apiKey = null) => {
    const payload = { provider };
    if (apiKey) {
      payload.api_key = apiKey;
    }
    
    const response = await aiApi.post('/test-connection/', payload);
    return response.data;
  },
};

// Chat Completion Service
export const chatService = {
  // Generate AI response
  generateResponse: async (messages, options = {}) => {
    const payload = {
      messages,
      ...options,
    };
    
    const response = await aiApi.post('/chat/', payload);
    return response.data;
  },

  // Generate streaming AI response
  generateStreamResponse: async (messages, options = {}, onChunk) => {
    const payload = {
      messages,
      stream: true,
      ...options,
    };

    // For streaming, we would typically use EventSource or similar
    // For now, implementing a basic approach
    const response = await fetch(`${API_BASE_URL}/api/ai/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// Utility functions
export const aiUtils = {
  // Detect provider from API key format
  detectProvider: (apiKey) => {
    if (!apiKey) return null;

    // OpenAI patterns
    if (apiKey.match(/^sk-proj-[A-Za-z0-9_-]+$/) || apiKey.match(/^sk-[A-Za-z0-9_-]{48,}$/)) {
      return 'openai';
    }

    // Anthropic patterns
    if (apiKey.match(/^sk-ant-api03-[A-Za-z0-9_-]+$/)) {
      return 'anthropic';
    }

    // Google patterns
    if (apiKey.match(/^AIza[A-Za-z0-9_-]{35}$/)) {
      return 'google';
    }

    // Check if it's a JSON (Google service account)
    try {
      const parsed = JSON.parse(apiKey);
      if (parsed.type === 'service_account' && parsed.private_key) {
        return 'google';
      }
    } catch (e) {
      // Not JSON, continue
    }

    return null;
  },

  // Validate API key format
  validateApiKeyFormat: (apiKey, provider) => {
    const detectedProvider = aiUtils.detectProvider(apiKey);
    return detectedProvider === provider;
  },

  // Format model name for display
  formatModelName: (model) => {
    if (!model) return '';
    
    // Convert model IDs to readable names
    const modelNames = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
      'claude-3-opus-20240229': 'Claude 3 Opus',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-pro': 'Gemini Pro',
      'gemini-pro-vision': 'Gemini Pro Vision',
    };

    return modelNames[model.id] || model.name || model.id;
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
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    };
  },

  // Get provider display name
  getProviderDisplayName: (provider) => {
    const names = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
    };
    return names[provider] || provider;
  },

  // Get provider color for UI
  getProviderColor: (provider) => {
    const colors = {
      openai: '#10a37f',
      anthropic: '#d4a574',
      google: '#4285f4',
    };
    return colors[provider] || '#6b7280';
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

// Export all services with error handling
export default {
  providers: Object.fromEntries(
    Object.entries(aiProviderService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  settings: Object.fromEntries(
    Object.entries(aiSettingsService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  apiKeys: Object.fromEntries(
    Object.entries(apiKeyService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  chat: Object.fromEntries(
    Object.entries(chatService).map(([key, fn]) => [key, withErrorHandling(fn)])
  ),
  utils: aiUtils,
};