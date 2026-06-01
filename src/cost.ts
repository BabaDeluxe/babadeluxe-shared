export interface MessageCost {
  inputTokens: number
  outputTokens: number
  costUsd: number
  modelId: string
}

export interface ModelRate {
  modelId: string
  inputRatePerToken: number
  outputRatePerToken: number
}
