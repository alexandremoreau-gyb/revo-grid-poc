import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const i18nConfigPath = fileURLToPath(new URL('./i18n.config.ts', import.meta.url))

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: '.',

  experimental: {
    serverAppConfig: false,
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
    },
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
