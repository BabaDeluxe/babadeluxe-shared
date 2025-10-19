import type { Socket as SocketBase } from 'socket.io-client'

export namespace Root {
  /** @desc The actual path of the Root namespace */
  export const path = '/'
  export type Emission = {
    updated: (p1: {
      settingKey: string
      settingValue: unknown
      dataType: 'string' | 'number' | 'boolean'
      updatedAt: string
    }) => void
    deleted: (p1: { settingKey: string }) => void
    error: (p1: { error: string }) => void
  }
  export type Actions = {
    getAll: (
      cb1: (p1: { success: boolean; data: any[]; error?: string | undefined }) => void
    ) => void
    update: (
      p1: {
        settingKey: string
        settingValue: unknown
        dataType: 'string' | 'number' | 'boolean'
      },
      cb2: (p1: { success: boolean; error?: string | undefined }) => void
    ) => void
    delete: (
      p1: {
        settingKey: string
      },
      cb2: (p1: { success: boolean; error?: string | undefined }) => void
    ) => void
  }
  /** @example const socket: Root.Socket = io(Root.path) */
  export type Socket = SocketBase<Emission, Actions>
}
