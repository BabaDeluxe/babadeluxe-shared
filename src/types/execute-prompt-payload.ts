export type ExecutePromptPayload = {
  readonly promptId: number
  readonly variables?: Record<string, unknown>
}
