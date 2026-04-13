export const siteStore = defineStore('site', () => {
  const site: Ref<Site> = ref({})

  const REACT401 = ref(0 as number)

  const openSite = (id: number) => {
    console.log(id)
    getSite(id)
  }

  const getSite = async (id: number) => {
    const resp: Site = await useApi(`/api/sites/${id}`).catch(error => error.data as ApiError)
    if (resp.id) {
      site.value = resp
      navigationStore().main = 'site'
    } else errorsStore().addError(resp)
  }

  return {
    site,
    REACT401,
    openSite
  }
})
