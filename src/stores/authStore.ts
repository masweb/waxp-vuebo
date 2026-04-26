import type { ApiError } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const nav = navigationStore()
  const st = siteStore()

  const initialToken = localStorage.getItem('auth_token')
  const initialUser = localStorage.getItem('auth_user')

  const token: Ref<string | null> = ref(initialToken)
  const user: Ref<User | null> = ref(initialUser ? JSON.parse(initialUser) : null)

  const isAuthenticated: ComputedRef<boolean> = computed(() => !!token.value)
  const isAdmin: ComputedRef<boolean> = computed(() => user.value?.role === 'admin')

  watch(
    () => st.REACT401,
    () => logout()
  )

  const initializeAuth = (): void => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (storedToken) {
      token.value = storedToken
      try {
        user.value = storedUser ? JSON.parse(storedUser) : null
      } catch (e) {
        console.error('Failed to parse user data from localStorage:', e)
        user.value = null // Clear potentially corrupted user data
        logout() // Also clear token if user data is corrupt
      }
    } else {
      // If no token, ensure user is also null
      user.value = null
    }
  }

  /**
   * Logs in the user by sending credentials to the backend API
   * and storing the token and user info.
   * @param {string} email - The username.
   * @param {string} password - The password.
   * @returns {Promise<void>}
   */
  const login = async (email: string, password: string): Promise<void> => {
    const resp: AuthResponse = await useApi('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    }).catch(error => error.data as ApiError)

    console.log('-----------', resp)

    if (resp.token) {
      token.value = resp.token
      user.value = resp.user
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      nav.main = 'dashboard'
    } else errorsStore().addError(resp)
  }

  /**
   * Logs out the user by clearing state and localStorage.
   */
  const logout = (): void => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('appNavigation')
    localStorage.removeItem('settingsNavigation')
    localStorage.removeItem('siteState')
    console.log('Logout successful!')
    nav.main = 'login'
  }

  // Expose state, getters, and actions
  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    initializeAuth, // Can be called manually if needed after initial load
    login,
    logout
  }
})

// Note: You should call `authStore.initializeAuth()` (or rely on initial state loading)
// when your application starts, typically in `main.ts`.
