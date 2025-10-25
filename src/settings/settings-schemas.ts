import { z } from 'zod'

const constraints = {
  apiKeyOpenai: { minLength: 23, required: false },
  apiKeyAnthropic: { minLength: 100, required: false },
  apiKeyGoogle: { minLength: 35, required: false },
} as const

export const settingSchemas = {
  apiKeyOpenai: z
    .string()
    .min(constraints.apiKeyOpenai.minLength)
    .describe('OpenAI API key for GPT models')
    .optional(),
  apiKeyAnthropic: z
    .string()
    .min(constraints.apiKeyAnthropic.minLength)
    .describe('Anthropic API key for Claude models')
    .optional(),
  apiKeyGoogle: z
    .string()
    .min(constraints.apiKeyGoogle.minLength)
    .describe('Google Gemini API key')
    .optional(),
} as const

export type SettingKey = keyof typeof settingSchemas

export const settingMetadata = {
  apiKeyOpenai: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyOpenai,
  },
  apiKeyAnthropic: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyAnthropic,
  },
  apiKeyGoogle: {
    category: 'apiKey',
    encrypted: true,
    dataType: 'string' as const,
    ...constraints.apiKeyGoogle,
  },
} as const

export type UserSettingWithValidation = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: 'string' | 'number' | 'boolean'
  readonly updatedAt: Date
  readonly category: string
  readonly encrypted: boolean
  readonly required: boolean
  readonly description: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly minValue?: number
  readonly maxValue?: number
}

export const userSettingWithValidationSchema = z.object({
  settingKey: z.string(),
  settingValue: z.unknown(),
  dataType: z.enum(['string', 'number', 'boolean']),
  updatedAt: z.iso.datetime(),
  required: z.boolean(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  description: z.string(),
  category: z.string(),
  encrypted: z.boolean(),
})

export function getSettingDefinition(
  key: string
): Omit<UserSettingWithValidation, 'settingKey' | 'settingValue' | 'updatedAt'> | undefined {
  const schema = settingSchemas[key as SettingKey]
  const metadata = settingMetadata[key as SettingKey]

  if (!schema || !metadata) return undefined

  return {
    category: metadata.category,
    encrypted: metadata.encrypted,
    dataType: metadata.dataType,
    required: metadata.required,
    description: schema.description ?? '',
    minLength: ('minLength' in metadata ? metadata.minLength : undefined) as number | undefined,
    maxLength: ('maxLength' in metadata ? metadata.maxLength : undefined) as number | undefined,
    minValue: ('minValue' in metadata ? metadata.minValue : undefined) as number | undefined,
    maxValue: ('maxValue' in metadata ? metadata.maxValue : undefined) as number | undefined,
  }
}

export function validateSetting(key: string, value: unknown) {
  const schema = settingSchemas[key as SettingKey]
  if (!schema) return { success: false as const, error: `Unknown setting: ${key}` }

  const result = schema.safeParse(value)
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, error: result.error.issues[0]?.message ?? 'Validation failed' }
}

export function getSettingsByCategory(category: string): SettingKey[] {
  return Object.entries(settingMetadata)
    .filter(([_, meta]) => meta.category === category)
    .map(([key]) => key as SettingKey)
}

export function getApiProviders() {
  return getSettingsByCategory('apiKey').map((key) => {
    const meta = settingMetadata[key]
    const schema = settingSchemas[key]
    return {
      key,
      name: key.replace('apiKey', ''),
      required: meta.required,
      description: schema.description,
    }
  })
}
