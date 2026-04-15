/**
 * i18n.config.ts
 * --------------
 * Point d'entrée de la config vue-i18n.
 * Charge les messages FR et EN, définit la locale par défaut.
 */
import en from './i18n/en'
import fr from './i18n/fr'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
}))
