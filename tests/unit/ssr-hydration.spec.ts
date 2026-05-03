import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readProjectFile(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('SSR hydration guards', () => {
  it('renders the app toast only on the client', () => {
    const app = readProjectFile('app.vue')

    expect(app).toMatch(/<ClientOnly>\s*<AppToast\s*\/>\s*<\/ClientOnly>/)
  })

  it('renders the confirm modal only on the client', () => {
    const tablePage = readProjectFile('components/layout/TablePage.vue')

    expect(tablePage).toMatch(/<ClientOnly>\s*<ConfirmModal\s*\/>\s*<\/ClientOnly>/)
  })
})
