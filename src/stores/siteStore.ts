export const siteStore = defineStore('site', () => {
  const site: any = ref({})
  const REACT401 = ref(0 as number)

  const openSite = (id: number) => {
    console.log(id)
    getSite(id)
  }

  const getSite = async (id: number) => {
    const resp: Site = await useApi(`/api/sites/${id}`)
    console.log(resp)
  }

  return {
    site,
    REACT401,
    openSite
  }
})
