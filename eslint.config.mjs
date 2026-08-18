/*
{
  "extends": "next",
  "plugins": ["@typescript-eslint", "simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": 0,
    "simple-import-sort/exports": 0,
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "warn",
    "import/no-anonymous-default-export": "warn"
  }
}
*/

// eslint.config.mjs
import js from '@eslint/js'
import pluginNext from '@next/eslint-plugin-next'
import prettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      '.next/',
      'node_modules/',
      'out/',
      'build/',
      'dist/',
      'public/',
      'next-env.d.ts',
      'sanity.types.ts',
      'schema.json',
    ],
  },

  // Global settings for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': pluginNext,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReact.configs.flat['jsx-runtime'].rules,
      ...pluginReactHooks.configs['recommended-latest'].rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  prettier,

  // TypeScript specific rules
  ...tseslint.configs.recommended,
)
