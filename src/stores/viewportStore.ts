export const viewportStore = defineStore('viewport', () => {
  const st = siteStore()

  const mobileBP = computed(() => st.site?.options?.mobileBP ?? 580)
  const tabletBP = computed(() => st.site?.options?.tabletBP ?? 768)

  const width: Ref<number> = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const mode: Ref<ViewportMode> = computed(() => {
    const w = width.value
    if (w <= mobileBP.value) return 'mobile'
    if (w <= tabletBP.value) return 'tablet'
    return 'desktop'
  })

  const onResize = () => {
    width.value = window.innerWidth
  }

  const showGrids: Ref<boolean> = ref(localStorage.getItem('showGrids') === 'true')

  watch(showGrids, (v) => localStorage.setItem('showGrids', String(v)))

  onMounted(() => window.addEventListener('resize', onResize))
  onScopeDispose(() => window.removeEventListener('resize', onResize))

  return { mode, width, mobileBP, tabletBP, showGrids }
})
