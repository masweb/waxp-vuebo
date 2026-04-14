const STORAGE_KEY = 'appNavigation'

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { main: 'dashboard' }
  } catch {
    return { main: 'dashboard' }
  }
}

export const navigationStore = defineStore('navigation', () => {
  const stored = loadFromStorage()
  const main = ref(stored.main)

  watch(main, (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ main: value }))
  })

  const setView = (view: string) => {
    main.value = view
  }
  return {
    main,
    setView
  }
})
