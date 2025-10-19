import { type FlatXoConfig, type XoConfigItem } from 'xo'
import sharedConfig from '@babadeluxe/xo-config'

const baseConfig = sharedConfig as XoConfigItem | XoConfigItem[]
const configArray = Array.isArray(baseConfig) ? baseConfig : [baseConfig]

const config: FlatXoConfig = [
  {
    ignores: ['src/generated-socket-types/**'],
  },
  ...configArray.map((item) => ({
    ...item,
    rules: {
      ...item.rules,
      'import-x/extensions': 'off' as const,
      '@typescript-eslint/consistent-type-exports': 'off' as const,
    },
  })),
]

export default config
