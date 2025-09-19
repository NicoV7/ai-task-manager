import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, Save } from 'lucide-react';
import styled from 'styled-components';
import aiService from '../services/ai';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${props => props.theme.textPrimary};
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.textSecondary};
  margin: 0;
  font-size: 16px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: ${props => props.theme.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.textPrimary};
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.textPrimary};
  margin-bottom: 8px;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: ${props => props.hasIcon ? '40px' : '12px'};
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: ${props => props.theme.textPrimary};
    background: ${props => props.theme.border};
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
  transition: all 0.2s;

  ${props => props.variant === 'primary' && `
    background: ${props.theme.primary};
    color: white;

    &:hover {
      background: ${props.theme.primaryHover};
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: ${props.theme.border};
    color: ${props.theme.textPrimary};

    &:hover {
      background: ${props.theme.borderHover};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin-top: 8px;
  margin-bottom: 0;
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