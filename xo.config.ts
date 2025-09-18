import { type FlatXoConfig } from 'xo'
import sharedConfig from '@babadeluxe/xo-config'

const baseConfig = sharedConfig
const configArray = Array.isArray(baseConfig) ? baseConfig : [baseConfig]

const config: FlatXoConfig = configArray.map((item) => ({
  ...item,
  rules: {
    ...item.rules,
    'import-x/extensions': 'off',
    '@typescript-eslint/consistent-type-exports': 'off',
  },
}))

export default config
