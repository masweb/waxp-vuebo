export const pageStore = defineStore('page', () => {
  const page: Ref<Page | null> = ref(null)
  const st = siteStore()

  const getPage = async (pageId: number) => {
    const resp: Page = await useApi(`/api/sites/${st?.site?.id}/pages/${pageId}`).catch(error => error.data as ApiError)
    if (resp.id) page.value = resp
  }

  return {
    page,
    getPage
  }
})
