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

describe('settingsNavigationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('initializes with null setting and false showsettings when no stored value', () => {
    const store = settingsStore()
    expect(store.setting).toBeNull()
    expect(store.showsettings).toBe(false)
  })

  it('initializes with stored values from localStorage', () => {
    localStorageMock._store['settingsNavigation'] = JSON.stringify({ setting: 'theme', showsettings: true })
    const store = settingsStore()
    expect(store.setting).toBe('theme')
    expect(store.showsettings).toBe(true)
  })

  it('falls back to defaults on corrupted localStorage', () => {
    localStorageMock._store['settingsNavigation'] = 'bad-json'
    const store = settingsStore()
    expect(store.setting).toBeNull()
    expect(store.showsettings).toBe(false)
  })

  it('setSetting updates both setting and showsettings', () => {
    const store = settingsStore()
    store.setSetting('routing')
    expect(store.setting).toBe('routing')
    expect(store.showsettings).toBe(true)
  })

  it('persists changes to localStorage via watch', async () => {
    const store = settingsStore()
    store.setSetting('pages')
    await new Promise(r => setTimeout(r, 0))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'settingsNavigation',
      JSON.stringify({ setting: 'pages', showsettings: true })
    )
  })
})
