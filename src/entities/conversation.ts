export type Conversation = {
  id: number
  title: string
  createdAt: Date
  updatedAt?: Date
  messageCount: number
  isActive: boolean
}
