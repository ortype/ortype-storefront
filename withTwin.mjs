// withTwin.js
import babelPluginSyntaxTypescript from '@babel/plugin-syntax-typescript'
import babelPluginMacros from 'babel-plugin-macros'
import babelPluginStyledComponents from 'babel-plugin-styled-components'
import path from 'path'
import { fileURLToPath } from 'url'

// https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// The folders containing files importing twin.macro
const includedDirs = [path.resolve(__dirname, './components')]

export default function withTwin(nextConfig) {
  return {
    ...nextConfig,
    webpack(config, options) {
      const { dev, isServer } = options
      // Make the loader work with the new app directory
      const patchedDefaultLoaders = options.defaultLoaders.babel
      patchedDefaultLoaders.options.hasServerComponents = false
      patchedDefaultLoaders.options.hasReactRefresh = false

      config.module = config.module || {}
      config.module.rules = config.module.rules || []
      config.module.rules.push({
        test: /\.(tsx|ts)$/,
        include: includedDirs,
        use: [
          patchedDefaultLoaders,
          {
            loader: 'babel-loader',
            options: {
              sourceMaps: dev,
              plugins: [
                babelPluginMacros,
                [babelPluginStyledComponents, { ssr: true, displayName: true }],
                [babelPluginSyntaxTypescript, { isTSX: true }],
              ],
            },
          },
        ],
      })

      if (!isServer) {
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
          module: false,
          path: false,
          os: false,
          crypto: false,
        }
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      } else {
        return config
      }
    },
  }
}
