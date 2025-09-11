import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, ExternalLink, TestTube, Save } from 'lucide-react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
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
  margin-bottom: 8px;
  color: ${props => props.theme.textPrimary};
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: ${props => props.hasIcon ? '40px' : '12px'};
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: ${props => props.theme.textPrimary};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: ${props => {
    if (props.variant === 'secondary') {
      return props.theme.border;
    }
    return props.theme.primary || '#3b82f6';
  }};
  color: ${props => {
    if (props.variant === 'secondary') {
      return props.theme.textPrimary;
    }
    return 'white';
  }};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        `;
      case 'failed':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        `;
      case 'pending':
      default:
        return `
          background: rgba(156, 163, 175, 0.1);
          color: #9ca3af;
        `;
    }
  }}
`;

const Alert = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  
  ${props => {
    switch (props.type) {
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        `;
      case 'info':
      default:
        return `
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        `;
    }
  }}
`;

const ProviderCard = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background: ${props => props.theme.cardBackground};
`;

const ProviderHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
`;

const ProviderName = styled.h3`
  color: ${props => props.theme.textPrimary};
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const ProviderStatus = styled.div`
  margin-left: auto;
`;

const HelpText = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin: 8px 0 0 0;
`;

const Link = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AISettings = () => {
  const [providers, setProviders] = useState([]);
  const [settings, setSettings] = useState({
    preferred_provider: 'openai',
    preferred_model: '',
    default_temperature: 0.7,
    default_max_tokens: 4096
  });
  const [apiKeys, setApiKeys] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({});
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [providersRes, settingsRes, keysRes] = await Promise.all([
        fetch('/api/ai/providers/'),
        fetch('/api/ai/settings/'),
        fetch('/api/ai/api-keys/')
      ]);

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData);
      } else {
        addAlert('Failed to load providers', 'error');
        setProviders([]); // Ensure empty array on failure
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      } else {
        addAlert('Failed to load settings', 'error');
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData);
      } else {
        addAlert('Failed to load API keys', 'error');
        setApiKeys({});
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addAlert('Failed to load AI settings', 'error');
      setProviders([]);
      setApiKeys({});
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/ai/settings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        addAlert('Settings saved successfully', 'success');
      } else {
        addAlert('Failed to save settings', 'error');
      }
    } catch (error) {
      addAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async (provider, apiKey) => {
    try {
      const response = await fetch('/api/ai/api-keys/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, api_key: apiKey })
      });

      if (response.ok) {
        addAlert(`${provider} API key saved successfully`, 'success');
        loadData(); // Reload to get updated status
      } else {
        const data = await response.json();
        addAlert(data.error || 'Failed to save API key', 'error');
      }
    } catch (error) {
      addAlert('Failed to save API key', 'error');
    }
  };

  const testConnection = async (provider) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    try {
      const response = await fetch('/api/ai/test-connection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider })
      });

      const result = await response.json();
      if (result.success) {
        addAlert(`${provider} connection test successful`, 'success');
      } else {
        addAlert(`${provider} connection test failed: ${result.error}`, 'error');
      }
      
      loadData(); // Reload to get updated test status
    } catch (error) {
      addAlert('Connection test failed', 'error');
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getAvailableModels = () => {
    const selectedProvider = providers.find(p => p.provider === settings.preferred_provider);
    return selectedProvider ? selectedProvider.models : [];
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>AI Settings</Title>
        <Subtitle>Configure your AI providers and preferences</Subtitle>
      </Header>

      {alerts.map(alert => (
        <Alert key={alert.id} type={alert.type}>
          <AlertCircle size={16} />
          {alert.message}
        </Alert>
      ))}

      <Section>
        <SectionTitle>Default Preferences</SectionTitle>
        
        <FormGroup>
          <Label>Preferred Provider</Label>
          <Select 
            value={settings.preferred_provider}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              preferred_provider: e.target.value,
              preferred_model: '' // Reset model when provider changes
            }))}
          >
            <option value="">Select a provider</option>
            {providers.map(provider => (
              <option key={provider.provider} value={provider.provider}>
                {provider.name}
              </option>
            ))}
          </Select>
          {providers.length === 0 && (
            <HelpText style={{ color: '#ef4444' }}>No providers available. Please check server connection.</HelpText>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Preferred Model</Label>
          <Select 
            value={settings.preferred_model}
            onChange={(e) => setSettings(prev => ({ ...prev, preferred_model: e.target.value }))}
            disabled={!settings.preferred_provider}
          >
            <option value="">Select a model</option>
            {getAvailableModels().map(model => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </Select>
          {!settings.preferred_provider && (
            <HelpText>Please select a provider first</HelpText>
          )}
          {settings.preferred_provider && getAvailableModels().length === 0 && (
            <HelpText style={{ color: '#ef4444' }}>No models available for selected provider</HelpText>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Default Temperature</Label>
          <Input 
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={settings.default_temperature}
            onChange={(e) => setSettings(prev => ({ ...prev, default_temperature: parseFloat(e.target.value) }))}
          />
          <HelpText>Controls randomness (0.0 = deterministic, 2.0 = very creative)</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Default Max Tokens</Label>
          <Input 
            type="number"
            min="1"
            max="128000"
            value={settings.default_max_tokens}
            onChange={(e) => setSettings(prev => ({ ...prev, default_max_tokens: parseInt(e.target.value) }))}
          />
          <HelpText>Maximum tokens for AI responses</HelpText>
        </FormGroup>

        <Button onClick={saveSettings} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Section>

      <Section>
        <SectionTitle>API Keys</SectionTitle>
        <HelpText style={{ marginBottom: '20px' }}>
          Configure your API keys for different AI providers. Keys are encrypted and stored securely.
        </HelpText>

        {providers.map(provider => {
          const keyData = apiKeys[provider.provider] || { has_key: false, test_status: 'pending' };
          const requirements = provider.api_key_requirements || {};
          
          return (
            <ProviderCard key={provider.provider}>
              <ProviderHeader>
                <ProviderName>{provider.name}</ProviderName>
                <ProviderStatus>
                  <StatusIndicator status={keyData.test_status}>
                    {keyData.test_status === 'success' && <Check size={14} />}
                    {keyData.test_status === 'failed' && <X size={14} />}
                    {keyData.test_status === 'pending' && <AlertCircle size={14} />}
                    {keyData.test_status}
                  </StatusIndicator>
                </ProviderStatus>
              </ProviderHeader>

              <FormGroup>
                <Label>API Key</Label>
                <InputContainer>
                  <Input
                    type={showKeys[provider.provider] ? 'text' : 'password'}
                    placeholder={keyData.has_key ? keyData.key_preview : requirements.example_format || 'Enter API key'}
                    onBlur={(e) => {
                      if (e.target.value) {
                        saveApiKey(provider.provider, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    hasIcon
                  />
                  <IconButton 
                    type="button"
                    onClick={() => toggleShowKey(provider.provider)}
                  >
                    {showKeys[provider.provider] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputContainer>
                
                {requirements.description && (
                  <HelpText>
                    {requirements.description}
                    {requirements.docs_url && (
                      <>
                        {' '}
                        <Link href={requirements.docs_url} target="_blank" rel="noopener noreferrer">
                          Get API Key <ExternalLink size={12} />
                        </Link>
                      </>
                    )}
                  </HelpText>
                )}

                {keyData.test_error_message && (
                  <Alert type="error">
                    <AlertCircle size={16} />
                    {keyData.test_error_message}
                  </Alert>
                )}
              </FormGroup>

              {keyData.has_key && (
                <Button 
                  variant="secondary"
                  onClick={() => testConnection(provider.provider)}
                  disabled={testing[provider.provider]}
                >
                  <TestTube size={16} />
                  {testing[provider.provider] ? 'Testing...' : 'Test Connection'}
                </Button>
              )}
            </ProviderCard>
          );
        })}
      </Section>
    </Container>
  );
};

export default AISettings;