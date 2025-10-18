import { ActionsFactory } from 'zod-sockets'
import { z } from 'zod'
import { settingsSocketConfig } from './settings-socket-config'

export const settingsFactory = new ActionsFactory(settingsSocketConfig)

// Define action schemas (no handlers yet, backend will add those)
export const getSettings = settingsFactory.build({
  event: 'getAll',
  input: z.tuple([]),
  output: z.tuple([
    z.object({
      success: z.boolean(),
      data: z.array(
        z.object({
          settingKey: z.string(),
          settingValue: z.unknown(),
          dataType: z.enum(['string', 'number', 'boolean']),
          updatedAt: z
            .date()
            .transform((date) => date.toISOString())
            .pipe(z.iso.datetime()),
          required: z.boolean(),
          description: z.string(),
          category: z.string(),
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          minValue: z.number().optional(),
          maxValue: z.number().optional(),
        })
      ),
    }),
  ]),
  async handler() {
    throw new Error('Backend only')
  },
})

export const updateSetting = settingsFactory.build({
  event: 'update',
  input: z.tuple([
    z.object({
      settingKey: z.string().min(1),
      settingValue: z.unknown(),
      dataType: z.enum(['string', 'number', 'boolean']),
    }),
  ]),
  output: z.tuple([z.object({ success: z.boolean() })]),
  async handler() {
    throw new Error('Backend only')
  },
})

export const deleteSetting = settingsFactory.build({
  event: 'delete',
  input: z.tuple([z.object({ settingKey: z.string() })]),
  output: z.tuple([z.object({ success: z.boolean() })]),
  async handler() {
    throw new Error('Backend only')
  },
})
