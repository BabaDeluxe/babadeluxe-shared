import { z } from 'zod'

/**
 * Socket configuration for LLM model operations
 *
 * WHY: Single action fetches all models from all providers at once
 * PATTERN: Returns grouped models { openai: [...], anthropic: [...], gemini: [...] }
 */

// Request: No input needed (uses authenticated user's stored API keys)
export const listAllModelsInputSchema = z.tuple([])

// Response: Models grouped by provider
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

export const modelSocketConfig = {
  models: {
    listAllModels: {
      input: listAllModelsInputSchema,
      output: listAllModelsOutputSchema,
    },
  },
}

// Export types
export type ListAllModelsOutput = z.infer<typeof listAllModelsOutputSchema>
