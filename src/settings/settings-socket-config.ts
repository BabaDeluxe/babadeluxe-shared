import { z } from 'zod'
import { createSimpleConfig } from 'zod-sockets'

export const settingsSocketConfig = createSimpleConfig({
  emission: {
    updated: {
      schema: z.tuple([
        z.object({
          settingKey: z.string(),
          settingValue: z.unknown(),
          dataType: z.enum(['string', 'number', 'boolean']),
          updatedAt: z
            .date()
            .transform((date) => date.toISOString())
            .pipe(z.iso.datetime()),
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
})
