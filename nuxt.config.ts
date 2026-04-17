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
