import type { Root as SettingsRoot } from './settings-socket-types.js'
import type { Root as ChatRoot } from './chat-socket-types.js'

/**
 * Merged socket types from all features.
 */
export namespace Root {
  export type Socket = SettingsRoot.Socket

  // Merge emissions from both features
  export type Emission = SettingsRoot.Emission & ChatRoot.Emission

  // Merge actions from both features
  export type Actions = SettingsRoot.Actions & ChatRoot.Actions
}

// Re-export individual roots if needed
export type { SettingsRoot, ChatRoot }
