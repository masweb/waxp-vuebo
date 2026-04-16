export const pageStore = defineStore('page', () => {
  const page: Ref<Page | null> = ref(null)
  const activeSection: Ref<Section | null> = ref(null)
  const st = siteStore()

  const getPage = async (pageId: number) => {
    const resp: Page = await useApi(`/api/sites/${st?.site?.id}/pages/${pageId}`).catch(error => error.data as ApiError)
    if (resp.id) page.value = resp
  }

  const setActiveSection = (id_section: number) =>
    (activeSection.value = page.value?.layout.find(section => section.id === id_section) ?? null)

  return {
    page,
    activeSection,
    getPage,
    setActiveSection
  }
})
