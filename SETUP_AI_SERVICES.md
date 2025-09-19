# Setting Up AI Services

This guide helps you configure the multi-provider AI system in the AI Task Manager, which allows you to use different AI services for intelligent task suggestions.

## Supported AI Providers

The application works with multiple AI providers, giving you flexibility in choosing your preferred service:

- **OpenAI** - Access to GPT models including GPT-4
- **Anthropic** - Claude models for conversational AI
- **Google AI** - Gemini models for various AI tasks

## Key Features

The AI integration includes several helpful features:
- Automatic detection of which AI provider you're using based on your API key
- Secure, encrypted storage of your API keys in the database
- Dynamic model selection that adapts to your chosen provider
- Built-in connection testing to verify your API keys work
- Personal preferences that are saved per user
- Easy-to-use web interface for configuration

## Getting Started

### Install Required Dependencies

First, make sure you have all the necessary Python packages:

```bash
cd backend
pip install -r requirements.txt
```

### Generate Your Encryption Key

For security, the application encrypts API keys before storing them. Generate an encryption key:

```bash
cd backend
python generate_encryption_key.py
```

Copy the generated key and add it to your `.env` file.

### Configure Your Environment

Update your `.env` file with the AI service settings:

```bash
# AI Provider API Keys (optional - users can add these through the web interface)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Encryption key for securing API keys in the database
FIELD_ENCRYPTION_KEY=your_generated_encryption_key_here
```

### Set Up the Database

Create and apply the necessary database migrations:

```bash
cd backend
python manage.py makemigrations ai_assistant
python manage.py migrate
```

### Start Your Development Environment

Run both the backend and frontend servers:

```bash
# Start the Django backend
cd backend
python manage.py runserver

# In another terminal, start the React frontend
cd frontend
npm start
```

## Available API Endpoints

The AI service provides several endpoints for managing providers and generating responses:

### Provider Information
- `GET /api/ai/providers/` - Get a list of all supported AI providers and their available models
- `GET /api/ai/providers/{provider}/` - Get detailed information about a specific provider

### User Preferences
- `GET /api/ai/settings/` - Retrieve your current AI preferences and settings
- `POST /api/ai/settings/` - Update your AI preferences and default settings

### API Key Management
- `GET /api/ai/api-keys/` - Check the status of your API keys for all providers
- `POST /api/ai/api-keys/` - Add or update an API key for a specific provider
- `DELETE /api/ai/api-keys/` - Remove an API key for a provider

### Testing and Usage
- `POST /api/ai/test-connection/` - Test if your API key works with the provider
- `POST /api/ai/chat/` - Generate an AI response using your configured settings

## Using the Web Interface

Once your servers are running, visit `http://localhost:3000/ai-settings` to set up your AI services:

1. **Choose your provider** - Select which AI service you want to use (OpenAI, Anthropic, or Google)
2. **Pick a model** - Choose from the available models for your selected provider
3. **Add your API key** - Securely store your API credentials
4. **Test the connection** - Verify that everything is working correctly
5. **Adjust settings** - Configure options like temperature and maximum response length

## Getting Your API Keys

### OpenAI Keys
- API keys start with `sk-proj-...` or `sk-...`
- Get your key from: https://platform.openai.com/api-keys

### Anthropic Keys
- API keys start with `sk-ant-api03-...`
- Get your key from: https://console.anthropic.com/

### Google AI Keys
- API keys start with `AIza...` or you can use Service Account JSON
- Get your key from: https://ai.google.dev/

## Code Examples

### Getting an AI Response

Here's how to request an AI response from your application:

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
    provider: 'openai',  // optional, uses your preferred provider if not specified
    model: 'gpt-4o',     // optional, uses your preferred model if not specified
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.content); // The AI's response
```

### Testing Your API Key

Before using an API key, you can test if it works:

```javascript
const testResult = await fetch('/api/ai/test-connection/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${userToken}`,
  },
  body: JSON.stringify({
    provider: 'openai',
    api_key: 'sk-...' // optional, tests your stored key if not provided
  })
});

const result = await testResult.json();
console.log(result.success); // true if the key works, false if not
```

## Security and Privacy

The application takes several steps to protect your API keys and data:

- **Encrypted storage**: All API keys are encrypted using Fernet symmetric encryption before being saved
- **User isolation**: Your API keys are completely separate from other users' keys
- **Format validation**: API keys are checked against known patterns to catch typos early
- **Connection testing**: Keys are verified to work before being stored
- **No exposure**: API keys are never sent back to your browser for security

## Troubleshooting Common Issues

The system handles various types of errors that might occur:

- **Authentication errors**: When API keys are invalid or expired
- **Rate limiting**: When you've exceeded your provider's usage limits
- **Network errors**: Connection problems between services
- **Validation errors**: When request data is formatted incorrectly
- **Provider-specific errors**: Issues specific to each AI service

## How It All Works Together

The AI system has a clean architecture that connects your frontend interface to multiple AI providers:

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

## Common Problems and Solutions

### If you run into issues:

1. **Import errors**: Make sure you've installed all the required Python packages
2. **API key format problems**: Double-check that your API key matches the expected format for your provider
3. **Connection failures**: Verify your API key is valid and you have internet connectivity
4. **Database issues**: Ensure you've run the database migrations

### Checking logs for more details:

```bash
# For development, run with verbose output
python manage.py runserver --verbosity=2

# For production, check your log files
tail -f /path/to/django.log
```

## What to Do Next

1. Set up your API keys using the web interface at `/ai-settings`
2. Test your connections to make sure everything is working
3. Start using the AI features in your task management workflow
4. Keep an eye on your usage and costs through your AI provider's dashboard

For more help with specific providers, check the documentation links available in the settings interface.