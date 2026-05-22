import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get _store() { return store }
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

describe('editorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('initializes with draw mode', () => {
    const store = editorStore()
    expect(store.mode).toBe('draw')
  })

  it('initializes with showModalNewBlock false', () => {
    const store = editorStore()
    expect(store.showModalNewBlock).toBe(false)
  })

  it('toggleMode switches from draw to edit', () => {
    const store = editorStore()
    expect(store.mode).toBe('draw')
    store.toggleMode()
    expect(store.mode).toBe('edit')
  })

  it('toggleMode switches from edit back to draw', () => {
    const store = editorStore()
    store.toggleMode()
    store.toggleMode()
    expect(store.mode).toBe('draw')
  })

  it('requestBlockType shows modal and returns a promise', async () => {
    const store = editorStore()
    const promise = store.requestBlockType()
    expect(store.showModalNewBlock).toBe(true)
    store.selectBlockType('Text')
    const result = await promise
    expect(result).toBe('Text')
  })

  it('selectBlockType resolves the pending promise and hides modal', async () => {
    const store = editorStore()
    const promise = store.requestBlockType()
    store.selectBlockType('Image')
    expect(await promise).toBe('Image')
    expect(store.showModalNewBlock).toBe(false)
  })

  it('selectBlockType works for all block types', async () => {
    const types: BlockType[] = ['Text', 'Image', 'Space', 'DarkMode', 'LanguageSwitcher', 'Button', 'Icon', 'Menu', 'Paste']
    const store = editorStore()

    for (const blockType of types) {
      const promise = store.requestBlockType()
      store.selectBlockType(blockType)
      expect(await promise).toBe(blockType)
    }
  })
})
