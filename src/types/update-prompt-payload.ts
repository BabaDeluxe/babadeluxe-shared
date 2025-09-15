export type UpdatePromptPayload = {
  readonly promptId: number
  readonly name?: string
  readonly command?: string
  readonly template?: string
  readonly description?: string
  readonly isActive?: boolean
}
