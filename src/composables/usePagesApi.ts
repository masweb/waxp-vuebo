export const usePagesApi = () => {
  const st = siteStore()

  const fetchPages = async (): Promise<Page[]> => {
    if (!st.site) return []
    const params = new URLSearchParams()
    params.set('filter[type]', 'page')
    const resp: ListPagesResponse = await useApi(`/api/sites/${st.site.id}/pages?${params}`)
    return resp.data
  }

  const createPage = async (data: CreatePageRequest, locale: string): Promise<Page> => {
    if (!st.site) throw new Error('No site selected')
    return await useApi(`/api/sites/${st.site.id}/pages?locale=${locale}`, {
      method: 'POST',
      body: data
    })
  }

  const updatePage = async (pageId: number, data: UpdatePageRequest, locale: string): Promise<Page> => {
    if (!st.site) throw new Error('No site selected')
    return await useApi(`/api/sites/${st.site.id}/pages/${pageId}?locale=${locale}`, {
      method: 'PUT',
      body: data
    })
  }

  const deletePage = async (pageId: number): Promise<void> => {
    if (!st.site) throw new Error('No site selected')
    await useApi(`/api/sites/${st.site.id}/pages/${pageId}`, {
      method: 'DELETE'
    })
  }

  return {
    fetchPages,
    createPage,
    updatePage,
    deletePage
  }
}
