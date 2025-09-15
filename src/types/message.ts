export type Message = {
  id: number
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}
