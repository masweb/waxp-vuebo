export const pageStore = defineStore('page', () => {
  const page: Ref<Page | null> = ref(null)
  const activeSection: Ref<Section | null> = ref(null)
  const activeBlock: Ref<Block | null> = ref(null)
  const openNewSectionId: Ref<number | null> = ref(null)
  const clipboardSection: Ref<Section | null> = ref(null)
  const currentLocale = ref('es')

  const _savedSectionId = localStorage.getItem('pageActiveSectionId')
  const _savedBlockId = localStorage.getItem('pageActiveBlockId')

  const st = siteStore()

  const restoreRefs = () => {
    if (_savedSectionId) {
      const id = Number(_savedSectionId)
      if (st.site?.options) {
        if (st.site.options.header?.id === id) {
          activeSection.value = st.site.options.header
        } else if (st.site.options.footer?.id === id) {
          activeSection.value = st.site.options.footer
        } else {
          activeSection.value = page.value?.layout.find(s => s.id === id) ?? null
        }
      } else {
        activeSection.value = page.value?.layout.find(s => s.id === id) ?? null
      }
    }
    if (_savedBlockId) {
      const bid = Number(_savedBlockId)
      const block = activeSection.value?.blocks?.find((b: Block) => b.id === bid) ?? null
      activeBlock.value = block
    }
  }

  watch(activeSection, (val) => {
    localStorage.setItem('pageActiveSectionId', val?.id?.toString() ?? '')
  })
  watch(activeBlock, (val) => {
    localStorage.setItem('pageActiveBlockId', val?.id?.toString() ?? '')
  })

  const getPage = async (pageId: number, locale: string) => {
    currentLocale.value = locale
    const resp: Page = await useApi(`/api/sites/${st?.site?.id}/pages/${pageId}?locale=${locale}`).catch(error => error.data as ApiError)
    if (resp.id) {
      page.value = resp
      historyStore().clear(resp.id)
      restoreRefs()
    }
  }

  const updatePage = async (locale: string) => {
    const resp = await useApi(`/api/sites/${st?.site?.id}/pages/${page?.value?.id}?locale=${locale}`, {
      method: 'PUT',
      body: page.value
    }).catch(error => error.data as ApiError)
    if (resp.id) {
      page.value = resp
      historyStore().clear(resp.id)
    }
  }

  const setActiveSection = (id_section: number) => {
    if (st.site?.options) {
      if (st.site.options.header?.id === id_section) {
        activeSection.value = st.site.options.header
        return
      }
      if (st.site.options.footer?.id === id_section) {
        activeSection.value = st.site.options.footer
        return
      }
    }
    activeSection.value = page.value?.layout.find(section => section.id === id_section) ?? null
  }

  const setActiveBlock = (block: Block | null) => {
    activeBlock.value = block
  }

  return {
    page,
    activeSection,
    activeBlock,
    openNewSectionId,
    clipboardSection,
    currentLocale,
    getPage,
    updatePage,
    setActiveSection,
    setActiveBlock
  }
})
