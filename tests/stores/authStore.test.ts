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

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

// Mock useApi at module level
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Mock dependent stores
vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({ REACT401: 0, site: null }))
}))

vi.mock('@/stores/navigationStore', () => ({
  navigationStore: vi.fn(() => ({
    main: '',
    set: vi.fn()
  }))
}))

vi.mock('@/stores/errorsStore', () => ({
  errorsStore: vi.fn(() => ({ addError: vi.fn() }))
}))

import { useAuthStore } from '@/stores/authStore'
import { useApi } from '@/composables/useApi'

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('initial state', () => {
    it('starts unauthenticated when no token in localStorage', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('starts authenticated when token exists in localStorage', () => {
      const userData = { id: 1, email: 'test@test.com' }
      localStorageMock._store['auth_token'] = 'my-token'
      localStorageMock._store['auth_user'] = JSON.stringify(userData)

      const store = useAuthStore()
      expect(store.token).toBe('my-token')
      expect(store.user).toEqual(userData)
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('isAdmin computed', () => {
    it('returns false when user is null', () => {
      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })

    it('returns true when user role is admin', () => {
      const userData = { id: 1, email: 'admin@test.com', role: 'admin' }
      localStorageMock._store['auth_token'] = 'token'
      localStorageMock._store['auth_user'] = JSON.stringify(userData)

      const store = useAuthStore()
      expect(store.isAdmin).toBe(true)
    })
  })

  describe('initializeAuth', () => {
    it('restores token and user from localStorage', () => {
      const userData = { id: 1, email: 'test@test.com' }
      localStorageMock._store['auth_token'] = 'restored-token'
      localStorageMock._store['auth_user'] = JSON.stringify(userData)

      const store = useAuthStore()
      store.initializeAuth()
      expect(store.token).toBe('restored-token')
      expect(store.user).toEqual(userData)
      expect(store.isAuthenticated).toBe(true)
    })

    it('clears user when no token in localStorage', () => {
      const store = useAuthStore()
      store.initializeAuth()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('login', () => {
    it('sets token and user on successful login', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, email: 'test@test.com' }
      }
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      await store.login('test@test.com', 'password123')

      expect(store.token).toBe('new-token')
      expect(store.user).toEqual({ id: 1, email: 'test@test.com' })
      expect(store.isAuthenticated).toBe(true)
    })

    it('persists token and user to localStorage on successful login', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, email: 'test@test.com' }
      }
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      await store.login('test@test.com', 'password123')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({ id: 1, email: 'test@test.com' }))
    })

    it('does not set token on failed login (no token in response)', async () => {
      const mockError = { error: 'Invalid credentials', code: 401 }
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockError)

      const store = useAuthStore()
      await store.login('test@test.com', 'wrong')

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('calls useApi with correct parameters', async () => {
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 't', user: { id: 1, email: 'e' } })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass123')

      expect(useApi).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'user@example.com', password: 'pass123' }
      })
    })
  })

  describe('logout', () => {
    it('clears token and user', () => {
      localStorageMock._store['auth_token'] = 'token'
      localStorageMock._store['auth_user'] = JSON.stringify({ id: 1, email: 'test@test.com' })

      const store = useAuthStore()
      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('removes all relevant items from localStorage', () => {
      const store = useAuthStore()
      store.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('appNavigation')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('settingsNavigation')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('siteState')
    })
  })
})
