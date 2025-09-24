export type CreatePromptPayload = {
  readonly name: string
  readonly command: string
  readonly template: string
  readonly description?: string
  readonly categoryId?: number
}
