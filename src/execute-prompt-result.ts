export type ExecutePromptResult = {
  readonly promptId: number
  readonly promptName: string
  readonly processedMessage: string
  readonly variables: Record<string, unknown>
  readonly executedAt: Date
}
