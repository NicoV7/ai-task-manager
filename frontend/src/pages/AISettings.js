import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, Save } from 'lucide-react';
import styled from 'styled-components';
import aiService from '../services/ai';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--color-text);
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
  transition: color 0.3s ease;
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 16px;
  transition: color 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h2`
  color: var(--color-text);
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
  transition: color 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: var(--color-text);
  margin-bottom: 8px;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: ${props => props.hasIcon ? '40px' : '12px'};
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }

  /* Night mode focus styles */
  [data-theme="night"] & {
    &:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }
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
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  /* Night mode focus styles */
  [data-theme="night"] & {
    &:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-text);
    background: var(--color-border);
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  transform: translateY(0);

  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(1px);
  }

  ${props => props.variant === 'primary' && `
    background-color: var(--color-primary);
    color: white;
    box-shadow: var(--shadow);
    border: 1px solid var(--color-primary);

    &:hover {
      background-color: var(--color-primary-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow);
    }

    /* Ensure proper styling in night mode */
    [data-theme="night"] & {
      background-color: #f97316;
      border-color: #f97316;

      &:hover {
        background-color: #ea580c;
        border-color: #ea580c;
        box-shadow: 0 4px 20px rgba(249, 115, 22, 0.5);
      }
    }
  `}

  ${props => props.variant === 'secondary' && `
    background-color: var(--color-secondary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);

    &:hover {
      background-color: var(--color-secondary-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }

    &::before {
      display: none;
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 10px;

  ${props => props.status === 'success' && `
    background: ${props.theme.success}20;
    color: ${props.theme.success};
  `}

  ${props => props.status === 'error' && `
    background: ${props.theme.danger}20;
    color: ${props.theme.danger};
  `}

  ${props => props.status === 'warning' && `
    background: ${props.theme.warning}20;
    color: ${props.theme.warning};
  `}
`;

const HelpText = styled.p`
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-top: 8px;
  margin-bottom: 0;
  transition: color 0.3s ease;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const AISettings = () => {
  const [settings, setSettings] = useState({
    has_api_key: false,
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    is_active: false,
    api_key_preview: '',
  });

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await aiService.settings.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedSettings = {
        model: settings.model,
        max_tokens: parseInt(settings.max_tokens),
        temperature: parseFloat(settings.temperature),
      };

      if (apiKey.trim()) {
        updatedSettings.api_key = apiKey.trim();
      }

      const data = await aiService.settings.updateSettings(updatedSettings);
      setSettings(data);
      setApiKey(''); // Clear the input after saving
      setTestResult({ success: true, message: 'Settings saved successfully!' });
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      setError(null);

      const testApiKey = apiKey.trim() || null;
      const result = await aiService.settings.testConnection(testApiKey);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const modelOptions = [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommended)' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Faster)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
  ];

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>AI Settings</Title>
          <Subtitle>Loading...</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>AI Settings</Title>
        <Subtitle>Configure your Claude AI integration for intelligent task assistance</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Claude API Configuration</SectionTitle>

        <FormGroup>
          <Label>Claude API Key</Label>
          <InputWrapper>
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings.has_api_key ? 'Enter new API key to replace existing' : 'sk-ant-api03-...'}
              hasIcon
            />
            <IconButton onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </InputWrapper>
          <HelpText>
            Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic Console</a>
            {settings.has_api_key && ` • Currently using: ${settings.api_key_preview}`}
          </HelpText>
        </FormGroup>

        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isTesting || (!apiKey.trim() && !settings.has_api_key)}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        </ButtonGroup>

        {testResult && (
          <StatusIndicator status={testResult.success ? 'success' : 'error'}>
            {testResult.success ? <Check size={16} /> : <X size={16} />}
            {testResult.message || testResult.error}
          </StatusIndicator>
        )}
      </Section>

      <Section>
        <SectionTitle>Model Settings</SectionTitle>

        <FormGroup>
          <Label>Claude Model</Label>
          <Select
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value })}
          >
            {modelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <HelpText>Choose the Claude model based on your needs for speed vs. capability</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Max Tokens</Label>
          <Input
            type="number"
            value={settings.max_tokens}
            onChange={(e) => setSettings({ ...settings, max_tokens: e.target.value })}
            min="100"
            max="8192"
          />
          <HelpText>Maximum tokens per AI response (100-8192)</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Temperature</Label>
          <Input
            type="number"
            value={settings.temperature}
            onChange={(e) => setSettings({ ...settings, temperature: e.target.value })}
            min="0"
            max="1"
            step="0.1"
          />
          <HelpText>Response creativity level (0.0 = more focused, 1.0 = more creative)</HelpText>
        </FormGroup>
      </Section>

      <ButtonGroup>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </ButtonGroup>

      {error && (
        <StatusIndicator status="error">
          <AlertCircle size={16} />
          {error}
        </StatusIndicator>
      )}

      {settings.is_active && (
        <StatusIndicator status="success">
          <Check size={16} />
          AI features are active and ready to use
        </StatusIndicator>
      )}
    </Container>
  );
};

export default AISettings;