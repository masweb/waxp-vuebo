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

describe('errorsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('starts with empty errors array', () => {
    const store = errorsStore()
    expect(store.errors).toEqual([])
  })

  it('addError adds an error to the list', () => {
    const store = errorsStore()
    store.addError({ error: 'Test error', code: 400 })
    expect(store.errors).toHaveLength(1)
    expect(store.errors[0].error).toBe('Test error')
    expect(store.errors[0].code).toBe(400)
    expect(store.errors[0].id).toMatch(/^err_/)
  })

  it('addError generates unique ids', () => {
    const store = errorsStore()
    store.addError({ error: 'Error 1', code: 400 })
    store.addError({ error: 'Error 2', code: 500 })
    expect(store.errors).toHaveLength(2)
    expect(store.errors[0].id).not.toBe(store.errors[1].id)
  })

  it('errors auto-remove after timeout', () => {
    vi.useFakeTimers()
    const store = errorsStore()
    store.addError({ error: 'Temporary', code: 404 })
    expect(store.errors).toHaveLength(1)

    vi.advanceTimersByTime(3000)
    expect(store.errors).toHaveLength(0)
    vi.useRealTimers()
  })

  it('can add multiple errors', () => {
    const store = errorsStore()
    store.addError({ error: 'First', code: 400 })
    store.addError({ error: 'Second', code: 500 })
    store.addError({ error: 'Third', code: 403 })
    expect(store.errors).toHaveLength(3)
  })
})
