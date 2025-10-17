export enum SettingEvents {
  GET_ALL = 'settings:getAll',
  UPDATE = 'settings:update',
  DELETE = 'settings:delete',
  UPDATED = 'settings:updated',
  DELETED = 'settings:deleted',
  ERROR = 'settings:error',
}

export type SettingUpdatedEvent = {
  readonly settingKey: string
  readonly settingValue: unknown
  readonly dataType: string
  readonly updatedAt: Date
}

export type SettingDeletedEvent = {
  readonly settingKey: string
}

export type SettingsErrorEvent = {
  readonly error: string
}
