import { z } from 'zod/v4'

export const settingsSocketConfig = {
  emission: {
    updated: {
      schema: z.tuple([
        z.object({
          settingKey: z.string(),
          settingValue: z.unknown(),
          dataType: z.enum(['string', 'number', 'boolean']),
          updatedAt: z.iso.datetime(),
        }),
      ]),
    },
    deleted: {
      schema: z.tuple([z.object({ settingKey: z.string() })]),
    },
    error: {
      schema: z.tuple([z.object({ error: z.string() })]),
    },
  },
}
