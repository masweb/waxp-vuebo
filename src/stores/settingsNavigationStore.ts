const STORAGE_KEY = 'settingsNavigation'

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { setting: null, showsettings: false }
  } catch {
    return { setting: null, showsettings: false }
  }
}

export const settingsStore = defineStore('settings', () => {
  const stored = loadFromStorage()
  const setting: Ref<string | null> = ref(stored.setting)
  const showsettings: Ref<boolean> = ref(stored.showsettings)

  watch([setting, showsettings], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ setting: setting.value, showsettings: showsettings.value }))
  })

  const setSetting = (view: string) => {
    setting.value = view
    showsettings.value = true
  }
  return {
    setting,
    showsettings,
    setSetting
  }
})
