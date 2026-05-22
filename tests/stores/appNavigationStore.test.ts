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

describe('appNavigationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('initializes with dashboard when no stored value', () => {
    const store = navigationStore()
    expect(store.main).toBe('dashboard')
  })

  it('initializes with stored value from localStorage', () => {
    localStorageMock._store['appNavigation'] = JSON.stringify({ main: 'site' })
    const store = navigationStore()
    expect(store.main).toBe('site')
  })

  it('falls back to dashboard on corrupted localStorage', () => {
    localStorageMock._store['appNavigation'] = 'not-json'
    const store = navigationStore()
    expect(store.main).toBe('dashboard')
  })

  it('setView updates main value', () => {
    const store = navigationStore()
    store.setView('login')
    expect(store.main).toBe('login')
  })

  it('persists changes to localStorage via watch', async () => {
    const store = navigationStore()
    store.setView('site')
    await new Promise(r => setTimeout(r, 0))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'appNavigation',
      JSON.stringify({ main: 'site' })
    )
  })
})
