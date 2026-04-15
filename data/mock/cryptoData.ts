import type { ColumnDef, RowData } from '~/types/grid'

const SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK',
  'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'ALGO', 'VET', 'FIL', 'THETA', 'MANA',
  'SAND', 'AXS', 'GALA', 'ENJ', 'CHZ', 'NEAR', 'FTM', 'ONE', 'HBAR', 'ICP',
  'EGLD', 'XTZ', 'EOS', 'AAVE', 'MKR', 'COMP', 'SNX', 'YFI', 'CRV', 'SUSHI',
]

const NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', BNB: 'BNB', SOL: 'Solana',
  XRP: 'XRP', ADA: 'Cardano', AVAX: 'Avalanche', DOT: 'Polkadot',
  MATIC: 'Polygon', LINK: 'Chainlink', UNI: 'Uniswap', ATOM: 'Cosmos',
  LTC: 'Litecoin', ETC: 'Ethereum Classic', XLM: 'Stellar', ALGO: 'Algorand',
  VET: 'VeChain', FIL: 'Filecoin', THETA: 'Theta Network', MANA: 'Decentraland',
  SAND: 'The Sandbox', AXS: 'Axie Infinity', GALA: 'Gala', ENJ: 'Enjin',
  CHZ: 'Chiliz', NEAR: 'NEAR Protocol', FTM: 'Fantom', ONE: 'Harmony',
  HBAR: 'Hedera', ICP: 'Internet Computer', EGLD: 'MultiversX', XTZ: 'Tezos',
  EOS: 'EOS', AAVE: 'Aave', MKR: 'Maker', COMP: 'Compound', SNX: 'Synthetix',
  YFI: 'Yearn Finance', CRV: 'Curve DAO', SUSHI: 'SushiSwap',
}

const ALL_TAGS = ['DeFi', 'Layer1', 'Layer2', 'NFT', 'Gaming', 'DAO', 'Bridge', 'Oracle', 'DEX', 'Lending', 'Store of Value', 'Smart Contracts', 'Metaverse', 'Storage', 'Privacy']

const CATEGORIES = ['Infrastructure', 'DeFi', 'Gaming & NFT', 'Payments', 'Storage', 'Governance']

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)]!
}

function pickN<T>(arr: T[], n: number, r: () => number): T[] {
  const shuffled = [...arr].sort(() => r() - 0.5)
  return shuffled.slice(0, n)
}

const BASE_PRICES: Record<string, number> = {
  BTC: 68000, ETH: 3400, BNB: 580, SOL: 175, XRP: 0.62,
  ADA: 0.45, AVAX: 38, DOT: 7.8, MATIC: 0.72, LINK: 18,
}

function getBasePrice(symbol: string, index: number): number {
  return BASE_PRICES[symbol] ?? Math.max(0.001, 200 - index * 3.8)
}

export function createCryptoRows(count = 50000): RowData[] {
  const rows: RowData[] = []
  const baseSymbols = SYMBOLS.length

  for (let i = 0; i < count; i++) {
    const rand = seededRand(i * 7919 + 1)
    const r = rand

    const symbolIndex = i % baseSymbols
    const symbol = SYMBOLS[symbolIndex]!
    const name = NAMES[symbol] ?? `Token ${i + 1}`
    const suffix = i < baseSymbols ? '' : ` (${Math.floor(i / baseSymbols) + 1})`

    const basePrice = getBasePrice(symbol, symbolIndex)
    const priceMult = 0.7 + r() * 0.6
    const price = basePrice * priceMult

    const change24h = (r() - 0.48) * 22
    const change7d = (r() - 0.46) * 45
    const marketCap = price * (1e6 + r() * 1e10)
    const volume = marketCap * (0.02 + r() * 0.18)
    const ath = price * (1.2 + r() * 3)
    const athDate = `2024-${String(Math.floor(r() * 12) + 1).padStart(2, '0')}-${String(Math.floor(r() * 28) + 1).padStart(2, '0')}`

    const tagCount = 1 + Math.floor(r() * 3)
    const tags = pickN(ALL_TAGS, tagCount, rand)
    const trending = r() > 0.85
    const watchlisted = r() > 0.7
    const score = Math.round(30 + r() * 70)
    const dominance = Math.round(r() * 1000) / 100
    const category = pick(CATEGORIES, r())

    rows.push({
      id: i + 1,
      rank: i + 1,
      symbol: symbol + suffix,
      name: name + suffix,
      category,
      price,
      change_24h: Math.round(change24h * 100) / 100,
      change_7d: Math.round(change7d * 100) / 100,
      market_cap: Math.round(marketCap),
      volume_24h: Math.round(volume),
      ath: Math.round(ath * 100) / 100,
      ath_date: athDate,
      dominance,
      score,
      tags,
      trending,
      watchlisted,
    })
  }

  return rows
}

// colPriority : 1 = toujours visible → 4 = large écran uniquement
// Breakpoints dans DataGrid.vue : <500 → p1 | 500-749 → p1-2 | 750-1049 → p1-3 | ≥1050 → tout
export const cryptoColumns: ColumnDef[] = [
  { prop: 'rank',        name: '#',           size: 64,  variant: 'id',           colPriority: 1 },
  { prop: 'symbol',      name: 'Symbol',      size: 96,  variant: 'symbol',       colPriority: 1 },
  { prop: 'price',       name: 'Price',       size: 130, variant: 'price',        colPriority: 1 },
  { prop: 'change_24h',  name: '24h %',       size: 110, variant: 'trend',        colPriority: 1 },
  { prop: 'name',        name: 'Name',        size: 180,                          colPriority: 2 },
  { prop: 'market_cap',  name: 'Market Cap',  size: 150, variant: 'large_number', colPriority: 2 },
  { prop: 'change_7d',   name: '7d %',        size: 110, variant: 'trend',        colPriority: 3 },
  { prop: 'volume_24h',  name: 'Volume 24h',  size: 140, variant: 'large_number', colPriority: 3 },
  { prop: 'score',       name: 'Score',       size: 140, variant: 'progress',     colPriority: 3 },
  { prop: 'category',    name: 'Category',    size: 160, variant: 'company',      colPriority: 4 },
  { prop: 'dominance',   name: 'Dom %',       size: 90,  variant: 'percent',      colPriority: 4 },
  { prop: 'tags',        name: 'Tags',        size: 220, variant: 'tags',         colPriority: 4 },
  { prop: 'trending',    name: 'Trending',    size: 100, variant: 'bool',         colPriority: 4 },
  { prop: 'watchlisted', name: 'Watchlist',   size: 100, variant: 'bool',         colPriority: 4 },
  { prop: 'ath',         name: 'ATH',         size: 120, variant: 'price',        colPriority: 4 },
  { prop: 'ath_date',    name: 'ATH Date',    size: 130, variant: 'date',         colPriority: 4 },
]
