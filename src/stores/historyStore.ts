const MAX_HISTORY = 50

interface Snapshot {
  layout: string
  siteOptions: string | null
}

/**
 * Deep-assign src into dst, preserving object references.
 * This ensures Vue reactivity stays intact (no JSON.parse replacement).
 * Arrays are spliced in-place so v-for keys resolve correctly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patchInPlace = (dst: any[], src: any[]) => {
  if (dst.length > src.length) dst.splice(src.length)
  for (let i = 0; i < src.length; i++) {
    if (i < dst.length) {
      deepAssign(dst[i], src[i])
    } else {
      dst.push(src[i])
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepAssign = (dst: any, src: any) => {
  if (dst === null || src === null || typeof dst !== 'object' || typeof src !== 'object') return
  if (Array.isArray(src)) {
    if (Array.isArray(dst)) {
      patchInPlace(dst, src)
    }
    return
  }
  for (const key of Object.keys(src)) {
    const sv = src[key]
    if (
      sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
      dst[key] !== null && typeof dst[key] === 'object' && !Array.isArray(dst[key])
    ) {
      deepAssign(dst[key], sv)
    } else if (Array.isArray(sv) && Array.isArray(dst[key])) {
      patchInPlace(dst[key], sv)
    } else {
      dst[key] = sv
    }
  }
  for (const key of Object.keys(dst)) {
    if (!(key in src)) {
      delete dst[key]
    }
  }
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

    // Stop TipTap editing before restoring — prevents stale editor state
    try { useTipTap().stopEditing() } catch {}

    ps.setActiveBlock(null)

    const newLayout = JSON.parse(snap.layout)

    // Patch layout in-place to preserve object references.
    // Vue components keep their props bound to the same objects.
    patchInPlace(ps.page.layout, newLayout)

    if (snap.siteOptions && ss.site) {
      deepAssign(ss.site.options, JSON.parse(snap.siteOptions))
    }
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
