import { computed, onMounted, onScopeDispose, readonly, ref } from 'vue'

const ALLOWED_THEMES = ['light', 'dark', 'auto'] as const
type Theme = (typeof ALLOWED_THEMES)[number]

const THEME_KEY = 'coreui-docs-theme'
const THEME_CHANGE_EVENT = 'coreui-theme-change'

const isBrowser = typeof window !== 'undefined'

const isValidTheme = (theme: unknown): theme is Theme =>
  typeof theme === 'string' && ALLOWED_THEMES.includes(theme as Theme)

const getStoredTheme = (): Theme | null => {
  if (!isBrowser) return null
  const stored = localStorage.getItem(THEME_KEY)
  return isValidTheme(stored) ? stored : null
}

const setStoredTheme = (theme: Theme): void => {
  if (!isBrowser) return
  localStorage.setItem(THEME_KEY, theme)
}

const getSystemPreference = (): 'light' | 'dark' => {
  if (!isBrowser) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getPreferredTheme = (): Theme => getStoredTheme() ?? getSystemPreference()

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => (theme === 'auto' ? getSystemPreference() : theme)

const applyThemeToDom = (theme: Theme): void => {
  if (!isBrowser) return
  const effective = getEffectiveTheme(theme)
  document.documentElement.setAttribute('data-coreui-theme', effective)
}

const currentTheme = ref<Theme>(isBrowser ? getPreferredTheme() : 'light')
let isInitialized = false

export const initTheme = (): void => {
  if (!isBrowser || isInitialized) return
  isInitialized = true
  const theme = getPreferredTheme()
  currentTheme.value = theme
  applyThemeToDom(theme)
}

let listenersCount = 0
let systemThemeCleanup: (() => void) | null = null

const setupSystemThemeListener = () => {
  if (!isBrowser || systemThemeCleanup) return

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (currentTheme.value === 'auto') {
      applyThemeToDom('auto')
    }
  }

  mq.addEventListener('change', handler)
  systemThemeCleanup = () => mq.removeEventListener('change', handler)
}

const cleanupSystemThemeListener = () => {
  if (systemThemeCleanup) {
    systemThemeCleanup()
    systemThemeCleanup = null
  }
}

const setTheme = (theme: Theme): void => {
  if (!isValidTheme(theme)) return

  applyThemeToDom(theme)
  setStoredTheme(theme)
  currentTheme.value = theme

  document.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { theme, effectiveTheme: getEffectiveTheme(theme) }
    })
  )
}

const toggleTheme = (): void => {
  const effective = getEffectiveTheme(currentTheme.value)
  setTheme(effective === 'light' ? 'dark' : 'light')
}

const handleThemeChange = (event: Event): void => {
  const customEvent = event as CustomEvent<{ theme: Theme }>
  if (isValidTheme(customEvent.detail?.theme)) {
    currentTheme.value = customEvent.detail.theme
  }
}

export const useTheme = () => {
  onMounted(() => {
    if (!isBrowser) return

    listenersCount++

    if (listenersCount === 1) {
      const theme = getPreferredTheme()
      currentTheme.value = theme
      applyThemeToDom(theme)
      setupSystemThemeListener()
      document.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)
    }
  })

  onScopeDispose(() => {
    if (!isBrowser) return

    listenersCount = Math.max(0, listenersCount - 1)

    if (listenersCount === 0) {
      document.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange)
      cleanupSystemThemeListener()
    }
  })

  return {
    theme: readonly(currentTheme),
    effectiveTheme: computed(() => getEffectiveTheme(currentTheme.value)),
    setTheme,
    toggleTheme,
    isDark: computed(() => getEffectiveTheme(currentTheme.value) === 'dark'),
    isLight: computed(() => getEffectiveTheme(currentTheme.value) === 'light'),
    isAuto: computed(() => currentTheme.value === 'auto'),
    THEME_CHANGE_EVENT,
    ALLOWED_THEMES
  }
}

export type { Theme }
export { THEME_CHANGE_EVENT, ALLOWED_THEMES }
