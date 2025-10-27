import { z } from 'zod/v4'
import { createSimpleConfig } from 'zod-sockets'

export const chatSocketConfig = createSimpleConfig({
  // Server -> Client
  emission: {
    messageChunk: {
      schema: z.tuple([
        z.object({
          messageId: z.number(),
          chunk: z.string(),
        }),
      ]),
    },
    messageComplete: {
      schema: z.tuple([
        z.object({
          messageId: z.number(),
          fullContent: z.string(),
        }),
      ]),
    },
    messageDeleted: {
      schema: z.tuple([
        z.object({
          messageId: z.number(),
        }),
      ]),
    },
    chatError: {
      schema: z.tuple([
        z.object({
          messageId: z.number().optional(),
          error: z.string(),
        }),
      ]),
    },
  },
})
