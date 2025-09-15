export type CompletionParameters = {
  model: string
  messages: Array<{ role: string; content: string }> // Generic interface type
  temperature?: number
  maxTokens?: number
}
