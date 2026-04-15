/**
 * nuxt.config.ts
 * --------------
 * Configuration principale du projet.
 * - Tailwind CSS v4 via plugin Vite
 * - @nuxtjs/i18n pour FR/EN
 * - CSS global injecté
 */
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'

const i18nConfigPath = fileURLToPath(new URL('./i18n.config.ts', import.meta.url))

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: '.',

  experimental: {
    serverAppConfig: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      script: [
        {
          children: `
            (function () {
              if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled = false
              }

              const originalWarn = console.warn.bind(console)
              console.warn = function (...args) {
                if (
                  args.length > 0 &&
                  typeof args[0] === 'string' &&
                  args[0].includes('<Suspense> is an experimental feature and its API will likely change.')
                ) {
                  return
                }
                return originalWarn.apply(console, args)
              }
            })()
          `,
          tagPosition: 'head',
        },
      ],
    },
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    vueI18n: i18nConfigPath,
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },

  compatibilityDate: '2024-11-01',
})
