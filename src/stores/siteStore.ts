export const siteStore = defineStore('site', () => {
  const site: any = ref({})
  const REACT401 = ref(0 as number)

  return {
    site,
    REACT401
  }
})
