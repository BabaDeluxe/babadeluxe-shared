import { z } from 'zod'

export const settingSchemas = {
  apiKeyOpenai: z.string().min(23).describe('OpenAI API key for GPT models'),
  apiKeyAnthropic: z.string().min(100).describe('Anthropic API key for Claude models'),
  apiKeyGoogle: z.string().min(35).describe('Google Gemini API key'),
} as const

export type SettingKey = keyof typeof settingSchemas

export const settingMetadata = {
  apiKeyOpenai: { category: 'apiKey', encrypted: true },
  apiKeyAnthropic: { category: 'apiKey', encrypted: true },
  apiKeyGoogle: { category: 'apiKey', encrypted: true },
} as const

export type UserSettingWithValidation = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: 'string' | 'number' | 'boolean'
  readonly updatedAt: Date
  readonly category: string
  readonly encrypted: boolean
}

type SettingDefinition = {
  readonly required: boolean
  readonly description: string
  readonly category: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly minValue?: number
  readonly maxValue?: number
}

const definitions: Record<string, SettingDefinition> = {
  apiKeyOpenai: {
    required: false,
    description: 'OpenAI API key for GPT models',
    category: 'apiKey',
    minLength: 23,
  },
  apiKeyAnthropic: {
    required: false,
    description: 'Anthropic API key for Claude models',
    category: 'apiKey',
    minLength: 100,
  },
  apiKeyGoogle: {
    required: false,
    description: 'Google Gemini API key',
    category: 'apiKey',
    minLength: 35,
  },
}

export const getSettingDefinition = (key: string): SettingDefinition | undefined => definitions[key]
