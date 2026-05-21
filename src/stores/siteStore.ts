import { loadSiteRoutes, clearRoutes } from '@/router'
import type { LocaleEntry } from '@/types/site'

const SITE_KEY = 'siteState'

const loadSiteState = () => {
  try {
    const stored = localStorage.getItem(SITE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const findDefaultLocale = (locales: LocaleEntry[]): string => {
  const def = locales.find(l => l.is_default)
  return def ? def.code : locales[0]?.code || 'es'
}

export const siteStore = defineStore('site', () => {
  const site: Ref<Site | null> = ref(null)
  const loadedLocale = ref('')

  const REACT401 = ref(0 as number)

  const openSite = async (id: number) => {
    const resp: Site = await useApi(`/api/sites/${id}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = resp
      loadedLocale.value = findDefaultLocale(resp.locales || [])
      if (resp.routes) await loadSiteRoutes(resp.routes)
      localStorage.setItem(SITE_KEY, JSON.stringify({ siteId: id }))
      navigationStore().main = 'site'
    } else errorsStore().addError(resp)
  }

  const loadSiteForLocale = async (locale: string) => {
    if (!site.value || loadedLocale.value === locale) return
    const prev = site.value
    const resp = await useApi(`/api/sites/${prev.id}?locale=${locale}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = { ...resp, routes: prev.routes }
      loadedLocale.value = locale
    }
  }

  const updateSite = async (locale: string) => {
    const prev = site.value
    if (!prev) return
    const resp = await useApi(`/api/sites/${prev.id}?locale=${locale}`, {
      method: 'PUT',
      body: { name: prev.name, domain: prev.domain, options: prev.options }
    }).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = { ...resp, routes: prev.routes }
      loadedLocale.value = locale
    }
  }

  const closeSite = async () => {
    clearRoutes()
    site.value = null
    loadedLocale.value = ''
    localStorage.removeItem(SITE_KEY)
  }

  const restoreSite = async () => {
    const state = loadSiteState()
    if (!state?.siteId) return false
    const resp: Site = await useApi(`/api/sites/${state.siteId}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = resp
      loadedLocale.value = findDefaultLocale(resp.locales || [])
      if (resp.routes) await loadSiteRoutes(resp.routes)
      return true
    }
    localStorage.removeItem(SITE_KEY)
    return false
  }

  const reloadRoutes = async () => {
    const resp = await useApi(`/api/sites/${site.value?.id}`)
    if (resp?.routes) {
      site.value = { ...site.value!, routes: resp.routes }
      await loadSiteRoutes(resp.routes)
    }
  }

  return {
    site,
    REACT401,
    openSite,
    closeSite,
    restoreSite,
    updateSite,
    loadSiteForLocale,
    reloadRoutes
  }
})
