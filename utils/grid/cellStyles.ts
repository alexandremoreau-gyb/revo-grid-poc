export const TAG_COLOR_MAP: Record<string, string> = {
  DeFi: 'bg-blue-50   text-blue-700   ring-blue-200/70   dark:bg-blue-500/12   dark:text-blue-300   dark:ring-blue-500/25',
  Layer1: 'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-500/12 dark:text-violet-300 dark:ring-violet-500/25',
  Layer2: 'bg-purple-50 text-purple-700 ring-purple-200/70 dark:bg-purple-500/12 dark:text-purple-300 dark:ring-purple-500/25',
  NFT: 'bg-pink-50   text-pink-700   ring-pink-200/70   dark:bg-pink-500/12   dark:text-pink-300   dark:ring-pink-500/25',
  Gaming: 'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-500/25',
  DAO: 'bg-teal-50   text-teal-700   ring-teal-200/70   dark:bg-teal-500/12   dark:text-teal-300   dark:ring-teal-500/25',
  Bridge: 'bg-sky-50    text-sky-700    ring-sky-200/70    dark:bg-sky-500/12    dark:text-sky-300    dark:ring-sky-500/25',
  Oracle: 'bg-amber-50  text-amber-700  ring-amber-200/70  dark:bg-amber-500/12  dark:text-amber-300  dark:ring-amber-500/25',
  DEX: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-500/12 dark:text-indigo-300 dark:ring-indigo-500/25',
  Lending: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/25',
  'Store of Value': 'bg-yellow-50 text-yellow-700 ring-yellow-200/70 dark:bg-yellow-500/12 dark:text-yellow-300 dark:ring-yellow-500/25',
  'Smart Contracts': 'bg-cyan-50   text-cyan-700   ring-cyan-200/70   dark:bg-cyan-500/12   dark:text-cyan-300   dark:ring-cyan-500/25',
  Metaverse: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70 dark:bg-fuchsia-500/12 dark:text-fuchsia-300 dark:ring-fuchsia-500/25',
  Storage: 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-500/12 dark:text-slate-300 dark:ring-slate-500/25',
  Privacy: 'bg-rose-50   text-rose-700   ring-rose-200/70   dark:bg-rose-500/12   dark:text-rose-300   dark:ring-rose-500/25',
}

export const TAG_DEFAULT_COLOR = 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-500/12 dark:text-slate-300 dark:ring-slate-500/25'

export const DOSSIER_STATUS_STYLES: Record<string, string> = {
  'Déposé': 'bg-emerald-600 text-white',
  'En cours': 'bg-blue-600 text-white',
  'En attente': 'bg-amber-500 text-white',
  'Incomplet': 'bg-orange-500 text-white',
  'Refusé': 'bg-red-600 text-white',
  'Annulé': 'bg-slate-400 text-white',
}

export const DOSSIER_STATUS_DEFAULT = 'bg-slate-400 text-white'

export const RISK_STYLES: Record<string, string> = {
  OK: 'bg-emerald-600 text-white',
  Attention: 'bg-amber-500 text-white',
  Critique: 'bg-red-600 text-white',
}

export const RISK_DEFAULT = 'bg-slate-400 text-white'

export const USER_ROLE_STYLES: Record<string, string> = {
  Admin: 'bg-violet-600 text-white',
  Manager: 'bg-blue-600 text-white',
  Opérateur: 'bg-amber-500 text-white',
  Lecteur: 'bg-slate-400 text-white',
}

export const USER_ROLE_DEFAULT = 'bg-slate-400 text-white'

export const USER_STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-600 text-white',
  Inactive: 'bg-red-600 text-white',
  Pending: 'bg-amber-500 text-white',
}

export const USER_STATUS_DEFAULT = 'bg-slate-400 text-white'

export function tagColor(tag: string): string {
  return TAG_COLOR_MAP[tag] ?? TAG_DEFAULT_COLOR
}

export function genericStatusClass(value: string): string {
  const normalized = value.toLowerCase()

  if (normalized.includes('inactive') || normalized.includes('danger')) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
  }

  if (normalized.includes('active') || normalized.includes('success')) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
  }

  if (normalized.includes('pending') || normalized.includes('draft')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  }

  return 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300'
}

export function progressColor(value: number): string {
  if (value >= 70) return 'bg-emerald-500'
  if (value >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}
