const SITE_KEY = 'siteState'

function loadSiteState() {
  try {
    const stored = localStorage.getItem(SITE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const siteStore = defineStore('site', () => {
  const site: Ref<Site | null> = ref(null)

  const REACT401 = ref(0 as number)

  const openSite = async (id: number) => {
    console.log(id)
    const resp: Site = await useApi(`/api/sites/${id}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = resp
      localStorage.setItem(SITE_KEY, JSON.stringify({ siteId: id }))
      navigationStore().main = 'site'
    } else errorsStore().addError(resp)
  }

  const closeSite = async () => {
    site.value = null
    localStorage.removeItem(SITE_KEY)
  }

  const restoreSite = async () => {
    const state = loadSiteState()
    if (!state?.siteId) return false
    const resp: Site = await useApi(`/api/sites/${state.siteId}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = resp
      return true
    }
    localStorage.removeItem(SITE_KEY)
    return false
  }

  return {
    site,
    REACT401,
    openSite,
    closeSite,
    restoreSite
  }
})
