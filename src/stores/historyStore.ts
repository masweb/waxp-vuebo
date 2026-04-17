const MAX_HISTORY = 50

interface Snapshot {
  layout: string
  siteOptions: string | null
}

export const historyStore = defineStore('history', () => {
  const ps = pageStore()
  const ss = siteStore()
  const past = ref<Record<number, Snapshot[]>>({})
  const future = ref<Record<number, Snapshot[]>>({})

  const currentPageId = computed(() => ps.page?.id)

  const getStacks = (): { p: Snapshot[]; f: Snapshot[] } | null => {
    const id = currentPageId.value
    if (!id) return null
    if (!past.value[id]) past.value[id] = []
    if (!future.value[id]) future.value[id] = []
    return { p: past.value[id], f: future.value[id] }
  }

  const capture = (): Snapshot | null => {
    if (!ps.page) return null
    return {
      layout: JSON.stringify(ps.page.layout),
      siteOptions: ss.site?.options ? JSON.stringify(ss.site.options) : null
    }
  }

  const restore = (snap: Snapshot) => {
    if (!ps.page) return
    ps.page.layout = JSON.parse(snap.layout)
    if (snap.siteOptions && ss.site) ss.site.options = JSON.parse(snap.siteOptions)
  }

  const snapshot = () => {
    const stacks = getStacks()
    const snap = capture()
    if (!stacks || !snap) return
    stacks.p.push(snap)
    if (stacks.p.length > MAX_HISTORY) stacks.p.shift()
    stacks.f.length = 0
  }

  const undo = () => {
    const stacks = getStacks()
    const current = capture()
    if (!stacks || !stacks.p.length || !current) return
    stacks.f.push(current)
    restore(stacks.p.pop()!)
  }

  const redo = () => {
    const stacks = getStacks()
    const current = capture()
    if (!stacks || !stacks.f.length || !current) return
    stacks.p.push(current)
    restore(stacks.f.pop()!)
  }

  const clear = (pageId: number) => {
    past.value[pageId] = []
    future.value[pageId] = []
  }

  const canUndo = computed(() => {
    const id = currentPageId.value
    return !!id && (past.value[id]?.length ?? 0) > 0
  })

  const canRedo = computed(() => {
    const id = currentPageId.value
    return !!id && (future.value[id]?.length ?? 0) > 0
  })

  return { snapshot, undo, redo, clear, canUndo, canRedo }
})
