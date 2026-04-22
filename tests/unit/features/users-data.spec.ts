import { describe, expect, it } from 'vitest'
import { columns } from '~/domains/users/columns'
import { createRows } from '~/domains/users/mockRows'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from '~/domains/users/constants'
import {
  USER_COMPANIES as exportedCompanies,
  USER_ROLES as exportedRoles,
  USER_STATUTS as exportedStatuts,
  columns as exportedColumns,
  createRows as exportedCreateRows,
} from '~/domains/users/data'

describe('users feature data', () => {
  it('exposes focused modules while keeping the data.ts public entrypoint compatible', () => {
    expect(exportedRoles).toBe(USER_ROLES)
    expect(exportedStatuts).toBe(USER_STATUTS)
    expect(exportedCompanies).toBe(USER_COMPANIES)
    expect(exportedColumns).toBe(columns)
    expect(exportedCreateRows).toBe(createRows)
  })

  it('keeps generated user rows deterministic for filters and overflow checks', () => {
    const rows = createRows(2)

    expect(columns.map((column) => column.prop)).toEqual([
      'id',
      'nom',
      'prenom',
      'email',
      'societe',
      'role',
      'statut',
      'dateCreation',
      'dernierAcces',
    ])
    expect(rows[0]).toMatchObject({
      id: 1,
      nom: 'Nom-A-Rallonge-Pour-Tester-Le-Truncate-Tooltip',
      prenom: 'Prenom-A-Rallonge-Pour-Verification-Tooltip',
      societe: 'SOCIETE DEMO AVEC UN NOM TRES LONG POUR TEST TOOLTIP',
      role: 'Administrateur principal multi-agences avec permissions etendues',
      statut: 'Activation en attente de validation longue',
      dateCreation: '2023-01-01',
      dernierAcces: '2025-01-01',
    })
    expect(rows[1]).toMatchObject({
      id: 2,
      nom: 'Garcia',
      prenom: 'Julien',
      email: 'julien.garcia@engiehomeservices.fr',
      societe: 'ENGIE HOME SERVICES',
      role: 'Admin',
      statut: 'Pending',
      dateCreation: '2024-02-02',
      dernierAcces: '2026-04-08',
    })
  })
})
