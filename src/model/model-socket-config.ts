import { z } from 'zod/v4'

/**
 * Input/output schemas for model actions
 *
 * PATTERN: Separate from config because these are for client→server actions
 * WHY: zod-sockets distinguishes between:
 * - Config emissions (server→client broadcasts)
 * - Action schemas (client→server request/response)
 */

export const listAllModelsInputSchema = z.tuple([])

export const listAllModelsOutputSchema = z.tuple([
  z.object({
    success: z.boolean(),
    models: z
      .object({
        openai: z.array(z.string()),
        anthropic: z.array(z.string()),
        gemini: z.array(z.string()),
      })
      .optional(),
    error: z.string().optional(),
  }),
])
