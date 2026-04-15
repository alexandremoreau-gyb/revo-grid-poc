import type { ColumnDef, RowData } from '~/types/grid'

const statuses = ['Active', 'Pending', 'Inactive'] as const
const cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Grenoble'] as const
const companies = ['OTC Flow', 'Acme', 'Globex', 'Umbrella', 'Innotech', 'BlueSoft'] as const

function randomItem<T>(items: readonly T[], index: number): T {
  if (items.length === 0) {
    throw new Error('randomItem requires a non-empty array')
  }

  return items[index % items.length]!
}

export const gridLabDefaultColumns: ColumnDef[] = [
  { prop: 'id', name: 'ID', size: 88 },
  { prop: 'name', name: 'Name', size: 180, editable: true },
  { prop: 'username', name: 'Username', size: 140, editable: true },
  { prop: 'status', name: 'Status', size: 130, variant: 'status' },
  { prop: 'createdAt', name: 'Created at', size: 140, variant: 'date' },
  { prop: 'email', name: 'Email', size: 240, variant: 'email', editable: true },
  { prop: 'city', name: 'City', size: 140 },
  { prop: 'company', name: 'Company', size: 180, variant: 'company' },
  { prop: 'amount', name: 'Amount', size: 130, variant: 'currency' },
  { prop: 'progress', name: 'Progress', size: 160, variant: 'progress' },
  { prop: 'actions', name: 'Actions', size: 110, variant: 'actions' },
]

export const gridLabDenseColumns: ColumnDef[] = [
  { prop: 'id', name: 'ID', size: 88 },
  { prop: 'name', name: 'Name', size: 180, editable: true },
  { prop: 'username', name: 'Username', size: 140, editable: true },
  { prop: 'status', name: 'Status', size: 130, variant: 'status' },
  { prop: 'createdAt', name: 'Created at', size: 140, variant: 'date' },
  { prop: 'email', name: 'Email', size: 240, variant: 'email', editable: true },
  { prop: 'city', name: 'City', size: 140 },
  { prop: 'company', name: 'Company', size: 180, variant: 'company' },
  { prop: 'amount', name: 'Amount', size: 130, variant: 'currency' },
  { prop: 'progress', name: 'Progress', size: 160, variant: 'progress' },
  { prop: 'score', name: 'Score', size: 120, variant: 'progress' },
  { prop: 'role', name: 'Role', size: 140 },
  { prop: 'team', name: 'Team', size: 140 },
  { prop: 'country', name: 'Country', size: 140 },
  { prop: 'actions', name: 'Actions', size: 110, variant: 'actions' },
]

export function createGridLabRows(count = 25): RowData[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const status = randomItem(statuses, index)
    const city = randomItem(cities, index)
    const company = randomItem(companies, index)

    return {
      id,
      name: `User ${id}`,
      username: `user_${id}`,
      status,
      createdAt: `2026-04-${String((id % 28) + 1).padStart(2, '0')}`,
      email: `user${id}@example.com`,
      city,
      company,
      amount: 75 + id * 13,
      progress: (id * 7) % 100,
      score: (id * 11) % 100,
      role: id % 3 === 0 ? 'Admin' : id % 2 === 0 ? 'Manager' : 'Member',
      team: id % 2 === 0 ? 'Ops' : 'Sales',
      country: id % 3 === 0 ? 'France' : id % 3 === 1 ? 'Belgium' : 'Spain',
    }
  })
}