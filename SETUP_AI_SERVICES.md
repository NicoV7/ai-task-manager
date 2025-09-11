# AI Services Setup Guide

This guide will help you set up the multi-provider AI service architecture for the AI Task Manager.

## Overview

The AI service architecture supports multiple AI providers:
- **OpenAI** (GPT models)
- **Anthropic** (Claude models)  
- **Google AI** (Gemini models)

Features:
- ✅ Auto-detection of provider from API key format
- ✅ Secure encrypted storage of API keys
- ✅ Dynamic model selection based on provider
- ✅ Connection testing and validation
- ✅ User-specific provider preferences
- ✅ Web-based settings interface

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Generate Encryption Key

```bash
cd backend
python generate_encryption_key.py
```

Copy the generated key and add it to your `.env` file.

### 3. Update Environment Configuration

Update your `.env` file with the new variables:

```bash
# AI Provider API Keys (optional - can be configured per user in the app)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Encryption key for API keys in database (use the generated key)
FIELD_ENCRYPTION_KEY=your_generated_encryption_key_here
```

### 4. Create Database Migrations

```bash
cd backend
python manage.py makemigrations ai_assistant
python manage.py migrate
```

### 5. Start the Development Server

```bash
# Backend
cd backend
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm start
```

## API Endpoints

The AI service provides the following endpoints:

### Provider Information
- `GET /api/ai/providers/` - List all supported providers and their models
- `GET /api/ai/providers/{provider}/` - Get specific provider details

### User Settings
- `GET /api/ai/settings/` - Get user's AI preferences
- `POST /api/ai/settings/` - Update user's AI preferences

### API Key Management
- `GET /api/ai/api-keys/` - Get user's API key status for all providers
- `POST /api/ai/api-keys/` - Add/update API key for a provider
- `DELETE /api/ai/api-keys/` - Delete API key for a provider

### Connection Testing
- `POST /api/ai/test-connection/` - Test API key connection

### Chat Completion
- `POST /api/ai/chat/` - Generate AI response

## Frontend Interface

Navigate to `http://localhost:3000/ai-settings` to configure:

1. **Provider Selection** - Choose your preferred AI provider
2. **Model Selection** - Select specific models based on your chosen provider
3. **API Key Configuration** - Securely store your API keys
4. **Connection Testing** - Verify your API keys work correctly
5. **Default Settings** - Set temperature, max tokens, etc.

## API Key Formats

### OpenAI
- Format: `sk-proj-...` or `sk-...`
- Get your key: https://platform.openai.com/api-keys

### Anthropic  
- Format: `sk-ant-api03-...`
- Get your key: https://console.anthropic.com/

### Google AI
- Format: `AIza...` or Service Account JSON
- Get your key: https://ai.google.dev/

## Usage Examples

### Basic Chat Completion

```javascript
const response = await fetch('/api/ai/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${userToken}`,
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    provider: 'openai',  // optional, uses user's preferred provider
    model: 'gpt-4o',     // optional, uses user's preferred model
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.content); // AI response
```

### Test Connection

```javascript
const testResult = await fetch('/api/ai/test-connection/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${userToken}`,
  },
  body: JSON.stringify({
    provider: 'openai',
    api_key: 'sk-...' // optional, tests stored key if not provided
  })
});

const result = await testResult.json();
console.log(result.success); // true/false
```

## Security Features

- **Encrypted Storage**: API keys are encrypted using Fernet symmetric encryption
- **User Isolation**: Each user's API keys are isolated and secure
- **Format Validation**: API keys are validated against known patterns
- **Connection Testing**: Keys are tested before storage
- **No Key Exposure**: API keys are never sent to the frontend

## Error Handling

The system provides comprehensive error handling:

- **Authentication Errors**: Invalid API keys
- **Rate Limiting**: Provider rate limit exceeded
- **Network Errors**: Connection issues
- **Validation Errors**: Invalid request format
- **Provider Errors**: Service-specific errors

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Django API     │    │  AI Providers   │
│   AI Settings   │◄──►│   AI Services    │◄──►│  OpenAI/Claude  │
│   Page          │    │   Factory        │    │  /Gemini        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌────────▼────────┐
                       │   Database      │
                       │   - API Keys    │
                       │   - Settings    │
                       │   - Chat Logs   │
                       └─────────────────┘
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Key Format Errors**: Verify API key format matches provider requirements
3. **Connection Failures**: Check API key validity and network connectivity
4. **Database Errors**: Ensure migrations are applied

### Logs

Check Django logs for detailed error information:
```bash
# Development
python manage.py runserver --verbosity=2

# Production
tail -f /path/to/django.log
```

## Next Steps

1. Configure your API keys in the web interface
2. Test connections to ensure everything works
3. Start using AI features in your task management
4. Monitor usage and costs through provider dashboards

For additional support, check the provider documentation links in the settings interface.