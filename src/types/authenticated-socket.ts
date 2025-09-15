import { type Socket } from 'socket.io'

export type AuthenticatedSocket = {
  data: {
    userId: string
  }
} & Socket
