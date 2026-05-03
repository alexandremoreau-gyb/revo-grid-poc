# Grille Mobile RevoGrid

Architecture de la vue mobile pour les pages dossiers et utilisateurs.

Le principe : RevoGrid est conservé en mobile pour rester sur un seul système de rendu. Chaque
ligne de données est éclatée en 2 ou 3 lignes virtuelles (accordéon) gérées entièrement par un
composant Vue injecté via `VGridVueTemplate`.

---

## Vue Rapide

```
pages/
  index.vue ────────┐
  users.vue ────────┤  useIsMobile() → switch desktop / mobile
                    │
                    ▼
domains/
  dossiers/columns.ts  ←── source de vérité (mobileInputType, selectOptions)
  users/columns.ts     ←── source de vérité (mobileInputType, selectOptions)
                    │
                    ▼
components/layout/
  MobileDossierRevoGrid.vue   ←── orchestre l'état (open, pending, editing)
  MobileUserRevoGrid.vue      ←── orchestre l'état (open, pending, editing)
                    │
                    │  VGridVueTemplate(Cell, { ...fonctions })
                    ▼
  MobileDossierRevoGridCell.vue   ←── rend summary / details / actions
  MobileUserRevoGridCell.vue      ←── rend summary / details / actions
                    │
                    │  import explicite requis (hors pipeline Nuxt auto-import)
                    ▼
  MobileGridActionsBar.vue    ←── boutons Enregistrer / Annuler (partagé)
                    │
                    ▼
@revolist/vue3-datagrid  (VGrid)
```

---

## Pourquoi RevoGrid en Mobile

RevoGrid gère le scroll virtualisé même sur mobile. Plutôt que de dédoubler l'architecture
(une grille desktop + une liste HTML mobile), la décision est d'utiliser RevoGrid des deux
côtés avec un rendu de cellule entièrement personnalisé côté mobile.

Avantages :
- une seule source de vérité pour l'état (pending, editing)
- scroll performant sur longues listes
- pas d'instanciation de deux bibliothèques différentes

Contraintes spécifiques :
- `VGridVueTemplate` crée un contexte Vue isolé → les imports explicites sont obligatoires
  (l'auto-import Nuxt ne fonctionne pas à l'intérieur)
- La hauteur de la grille est calculée manuellement à partir des `rowDefinitions`
- La scrollbar RevoGrid est masquée (CSS) pour ne pas doubler la scrollbar native iOS

---

## Lignes Virtuelles — Accordéon

Chaque ligne de données est éclatée en 1 à 3 lignes RevoGrid selon l'état :

```
┌─────────────────────────────────────┐  52px   rowKind: 'summary'
│ RÉFÉRENCE / NOM     [badge]  [v]    │         toujours visible, cliquable
└─────────────────────────────────────┘

  (si openId === rowId)

┌─────────────────────────────────────┐  280–380px  rowKind: 'details'
│ LABEL          valeur éditable      │              champs + lecture seule
│ LABEL          valeur éditable      │
│ ...                                 │
└─────────────────────────────────────┘

  (si liveHasPendingChanges)

┌─────────────────────────────────────┐  56px   rowKind: 'actions'
│ [ Enregistrer ]    [ Annuler ]      │         barre de confirmation
└─────────────────────────────────────┘
```

Taille par `rowKind` :

| rowKind   | Dossier | Utilisateur |
|-----------|---------|-------------|
| `summary` | 52 px   | 52 px       |
| `details` | 380 px  | 280 px      |
| `actions` | 56 px   | 56 px       |

---

## Source de Vérité — ColumnDef

Les métadonnées mobiles vivent dans `ColumnDef` (même objet que le desktop) :

```typescript
// types/grid.ts
interface ColumnDef {
  prop: string
  name?: string            // label affiché dans les headers desktop
  label?: string           // alias (mobile utilise name ?? label ?? prop)
  editable?: boolean       // si false → lecture seule partout
  mobileInputType?: 'text' | 'number' | 'date' | 'email' | 'select'
  selectOptions?: readonly string[]   // uniquement si mobileInputType === 'select'
}
```

Seules les colonnes avec `editable: true` ET `mobileInputType` défini apparaissent comme
éditables en mobile. Le reste est affiché en lecture seule (champs hardcodés dans la zone
`details` de chaque Cell).

Exemple dans `domains/users/columns.ts` :

```typescript
{ prop: 'prenom',  editable: true, mobileInputType: 'text' }
{ prop: 'role',    editable: true, mobileInputType: 'select', selectOptions: USER_ROLES }
{ prop: 'dateCreation', editable: false }   // → lecture seule en mobile
```

---

## État — MobileXxxRevoGrid

Tout l'état est centralisé dans le composant `MobileXxxRevoGrid`, pas dans la cellule :

```
openId          ref<number | null>   → quelle ligne est ouverte
editingField    ref<{ rowId, prop }> → quel champ est en cours d'édition
pendingChanges  ref<Record<number, Record<string, string>>>
draftValue      ref<string>          → valeur en cours de frappe
gridNonce       ref<number>          → force le recalcul des gridRows
```

Les fonctions de mutation (`startEdit`, `storeEdit`, `commitRow`, `cancelRow`…) sont définies
dans le parent et passées à la cellule via `VGridVueTemplate` en tant que props statiques.

Différence entre `pendingChanges` et `draftValue` :

```
draftValue      → valeur en cours dans l'input actif (pas encore validée)
pendingChanges  → valeur validée (blur / Enter) mais pas encore commitée sur la ligne
```

`liveHasPendingChanges` combine les deux pour savoir si la barre actions doit apparaître.

---

## VGridVueTemplate — Import Explicite Obligatoire

`VGridVueTemplate` rend les composants dans un contexte Vue isolé, en dehors du pipeline
Nuxt. L'auto-import Nuxt ne s'applique pas à l'intérieur.

Règle : tout composant enfant utilisé dans une Cell doit être importé explicitement.

```typescript
// ✅ obligatoire dans MobileDossierRevoGridCell.vue
import MobileGridActionsBar from '~/components/layout/MobileGridActionsBar.vue'

// ❌ l'auto-import Nuxt ne fonctionne pas ici → composant silencieusement absent
```

Cette règle s'applique à tout futur composant extrait d'une Cell.

---

## Composant Partagé — MobileGridActionsBar

La barre Enregistrer / Annuler est identique entre dossiers et utilisateurs.
Elle est extraite dans `MobileGridActionsBar.vue` et importée explicitement dans chaque Cell.

```
components/layout/
  MobileGridActionsBar.vue
    props:
      row:        RowData               → passé à commitRow
      rowId:      number                → passé à cancelRow
      commitRow:  (row: RowData) => void
      cancelRow:  (rowId: number) => void
```

Attributs data conservés pour les tests :

```html
<button data-row-confirm>Enregistrer</button>
<button data-row-cancel>Annuler</button>
```

---

## Différences entre DossierCell et UserCell

| Point                  | MobileDossierRevoGridCell     | MobileUserRevoGridCell            |
|------------------------|-------------------------------|-----------------------------------|
| Ligne summary          | `row.reference` + badge statut + badge risque | `prenom + nom`    |
| Champs lecture seule   | Fiche, CUMAC, Volume MWh, Risque | Créé le, Dernier accès          |
| Formateur              | `formatCurrency` (prop)       | `formatDate` (prop)               |
| `fieldType` retourne   | `'text' \| 'number' \| 'date' \| 'select'` | `+ 'email'`        |
| `rowId`                | index dans `props.rows`       | `row.id as number`                |

La différence de `rowId` est importante : dossiers n'ont pas d'id stable → on utilise l'index.
Utilisateurs ont un id métier → on l'utilise directement.

---

## Recalcul Forcé — gridNonce

RevoGrid ne re-rend pas automatiquement quand les données des lignes virtuelles changent
(car les objets sont mutés, pas remplacés). `gridNonce` est un compteur incrémenté à chaque
mutation qui force `gridRows` (computed) à se recalculer.

```typescript
function touchGrid() { gridNonce.value += 1 }

// Dans le computed gridRows :
gridNonce.value   // lecture seule → crée la dépendance réactive
```

Toute fonction qui mute l'état appelle `touchGrid()` à la fin.

---

## Scrollbar Masquée

RevoGrid ajoute ses propres scrollbars. En mobile, elles doublent la scrollbar native iOS
et créent un décalage visuel. Elles sont masquées via CSS sur chaque grille :

```css
.mobile-dossier-revo-grid revogr-scroll-virtual.vertical {
  opacity: 0;
  pointer-events: none;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}
```

Même règle pour `.horizontal` et pour `.mobile-user-revo-grid`.

---

## Ajouter un Nouveau Tableau Mobile

1. Créer `domains/mondomaine/columns.ts` — ajouter `mobileInputType` et `selectOptions` sur
   les colonnes éditables
2. Dupliquer `MobileXxxRevoGrid.vue` — adapter `display` (la valeur affichée en summary) et
   la logique de `rowId`
3. Dupliquer `MobileXxxRevoGridCell.vue` — adapter la zone `details` (champs lecture seule
   spécifiques au domaine) et la zone `summary`
4. Importer **explicitement** `MobileGridActionsBar` dans la nouvelle Cell
5. Brancher sur la page via `useIsMobile()` comme pour index.vue / users.vue
