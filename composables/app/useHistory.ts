import { ref } from 'vue'

export interface HistoryEntry {
  id: number
  at: Date
  user: string
  reference: string
  field: string
  from: string
  to: string
}

let nextId = 0

function d(daysAgo: number, h: number, m: number): Date {
  const dt = new Date()
  dt.setDate(dt.getDate() - daysAgo)
  dt.setHours(h, m, 0, 0)
  return dt
}

const entries = ref<HistoryEntry[]>([
  { id: ++nextId, at: d(7, 9, 12),  user: 'Alexandre', reference: 'BAR-TH-123-2024-03-15-001', field: 'statut', from: 'En attente', to: 'Déposé' },
  { id: ++nextId, at: d(7, 10, 34), user: 'Alexandre', reference: 'BAT-EQ-127-2024-07-02-012', field: 'risque', from: 'OK',         to: 'Attention' },
  { id: ++nextId, at: d(6, 14, 5),  user: 'Alexandre', reference: 'BAR-TH-171-2025-01-08-028', field: 'statut', from: 'En cours',   to: 'En attente' },
  { id: ++nextId, at: d(5, 11, 20), user: 'Alexandre', reference: 'BAT-TH-122-2024-11-20-045', field: 'risque', from: 'Attention',  to: 'Critique' },
  { id: ++nextId, at: d(4, 16, 48), user: 'Alexandre', reference: 'BAR-TH-123-2025-02-03-057', field: 'statut', from: 'Déposé',     to: 'Annulé' },
  { id: ++nextId, at: d(3, 9, 3),   user: 'Alexandre', reference: 'BAT-EN-107-2024-06-14-072', field: 'risque', from: 'Critique',   to: 'Attention' },
  { id: ++nextId, at: d(2, 15, 30), user: 'Alexandre', reference: 'BAR-TH-143-2025-04-01-089', field: 'statut', from: 'En attente', to: 'Déposé' },
  { id: ++nextId, at: d(1, 10, 15), user: 'Alexandre', reference: 'BAT-EQ-127-2024-09-22-103', field: 'statut', from: 'Incomplet',  to: 'En attente' },
])

export function useHistory() {
  function addEntry(reference: string, field: string, from: unknown, to: unknown) {
    entries.value.unshift({
      id: ++nextId,
      at: new Date(),
      user: 'Alexandre',
      reference: String(reference),
      field: String(field),
      from: String(from ?? '—'),
      to: String(to ?? '—'),
    })
  }

  return { entries, addEntry }
}
