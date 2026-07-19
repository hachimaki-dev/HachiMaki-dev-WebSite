import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore built output and agent draft scripts
  globalIgnores(['dist', '_drafts']),

  // ── Node.js scripts & config files ─────────────────────────────────────
  {
    files: [
      'scripts/**/*.js',
      'vite.config.js',
      'vitest.config.js',
    ],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-useless-escape': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // ── Test files (Vitest + Node) ──────────────────────────────────────────
  {
    files: ['tests/**/*.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // ── React source files ──────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/**/__tests__/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // router.jsx legitimately exports lazy components alongside constants
      'react-refresh/only-export-components': 'warn',
      // setState in a useEffect to sync derived state is a valid React pattern
      'react-hooks/set-state-in-effect': 'warn',
      // Accessing ref.current in dependency arrays is intentional in this project
      'react-hooks/refs': 'warn',
      // Unused caught errors are typically silenced intentionally
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      // Allow empty blocks with a comment (e.g. try/catch that swallows errors)
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
    },
  },
])
