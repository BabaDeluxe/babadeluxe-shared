export type SharedLinkType = 'message' | 'conversation' | 'space'
export interface SharedLink {
  id: string
  type: SharedLinkType
  targetId: string
  ownerId: string
  collaborative: boolean
  costCapUsd: number | null // required when collaborative = true
  costSpentUsd: number
  expiresAt: string | null // null = permanent until reached
  revokedAt: string | null
  createdAt: string | null
}
export interface ForkedConversation {
  id: string
  sharedFromConversationId: string
  ownerId: string
}

