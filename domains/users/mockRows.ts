import type { RowData } from '~/types/grid'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from './constants'

const FIRST_NAMES = [
  'Alexandre',
  'Marie',
  'Thomas',
  'Sophie',
  'Nicolas',
  'Camille',
  'Pierre',
  'Julie',
  'Antoine',
  'Claire',
  'Julien',
  'Emma',
  'François',
  'Laura',
  'Baptiste',
  'Lucie',
  'Maxime',
  'Léa',
  'Romain',
  'Chloé',
] as const

const LAST_NAMES = [
  'Martin',
  'Bernard',
  'Dubois',
  'Thomas',
  'Robert',
  'Richard',
  'Petit',
  'Durand',
  'Leroy',
  'Moreau',
  'Simon',
  'Laurent',
  'Lefebvre',
  'Michel',
  'Garcia',
  'David',
  'Bertrand',
  'Roux',
  'Vincent',
  'Fournier',
] as const

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function createRows(count: number): RowData[] {
  return Array.from({ length: count }, (_, i) => {
    const prenom = pick(FIRST_NAMES, i * 7 + 3)
    const nom = pick(LAST_NAMES, i * 13 + 1)
    const societe = pick(USER_COMPANIES, i)
    const role = pick(USER_ROLES, i * 3 + 1)
    const statut = pick(USER_STATUTS, i * 2)

    const dateCreation = formatDate(2023 + (i % 2), (i % 12) + 1, (i % 28) + 1)
    const dernierAcces = formatDate(2025 + (i % 2), ((i * 3) % 12) + 1, ((i * 7) % 28) + 1)
    const isLongRow = i === 0

    return {
      id: i + 1,
      nom: isLongRow ? 'Nom-A-Rallonge-Pour-Tester-Le-Truncate-Tooltip' : nom,
      prenom: isLongRow ? 'Prenom-A-Rallonge-Pour-Verification-Tooltip' : prenom,
      email: isLongRow
        ? 'prenom.nom.tres.long.pour.verifier.le.tooltip.du.tableau.users@entreprise-demo-ultra-longue.fr'
        : `${prenom.toLowerCase()}.${nom.toLowerCase()}@${societe.toLowerCase().replace(/\s+/g, '')}.fr`,
      societe: isLongRow ? 'SOCIETE DEMO AVEC UN NOM TRES LONG POUR TEST TOOLTIP' : societe,
      role: isLongRow ? 'Administrateur principal multi-agences avec permissions etendues' : role,
      statut: isLongRow ? 'Activation en attente de validation longue' : statut,
      dateCreation,
      dernierAcces,
    }
  })
}
