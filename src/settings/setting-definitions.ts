export const settingDefinitions = {
  apiKeyOpenai: {
    category: 'apiKey',
    dataType: 'string' as const,
    required: true,
    minLength: 23,
    description: 'OpenAI API key for GPT models',
    encrypted: true,
  },
  apiKeyAnthropic: {
    category: 'apiKey',
    dataType: 'string' as const,
    required: true,
    minLength: 100,
    description: 'Anthropic API key for Claude models',
    encrypted: true,
  },
  apiKeyGoogle: {
    category: 'apiKey',
    dataType: 'string' as const,
    required: true,
    minLength: 35,
    description: 'Google Gemini API key',
    encrypted: true,
  },
  theme: {
    category: 'ui',
    dataType: 'string' as const,
    required: false,
    maxLength: 50,
    description: 'UI theme preference',
    encrypted: false,
  },
  maxTokens: {
    category: 'llm',
    dataType: 'number' as const,
    required: false,
    minValue: 1,
    maxValue: 4096,
    description: 'Default max tokens for LLM responses',
    encrypted: false,
  },
  autoSave: {
    category: 'editor',
    dataType: 'boolean' as const,
    required: false,
    description: 'Enable auto-save for conversations',
    encrypted: false,
  },
} as const

export type SettingKey = keyof typeof settingDefinitions
export type SettingDefinition = (typeof settingDefinitions)[SettingKey]
export type SettingDataType = 'string' | 'number' | 'boolean'

export const getSettingDefinition = (key: string): SettingDefinition | undefined => {
  return settingDefinitions[key as SettingKey]
}
