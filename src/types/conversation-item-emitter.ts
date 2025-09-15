export type ConversationItemEmitter = {
  delete: [id: number]
  update: [id: number, content: string]
}
