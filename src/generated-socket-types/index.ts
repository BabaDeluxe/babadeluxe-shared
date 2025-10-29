import type { Root as SettingsRoot } from './settings-socket-types.js'
import type { Root as ChatRoot } from './chat-socket-types.js'
import type { Root as ModelsRoot } from './models-socket-types.js'

export namespace Root {
  export type Socket = SettingsRoot.Socket

  export type Emission = SettingsRoot.Emission & ChatRoot.Emission & ModelsRoot.Emission

  export type Actions = SettingsRoot.Actions & ChatRoot.Actions & ModelsRoot.Actions
}

export type { SettingsRoot, ChatRoot, ModelsRoot }
