import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export function useSectionGrid(section: () => Section) {
  const vp = viewportStore()
  const sectionRef = ref<HTMLElement>()
  const canvasRef = ref<HTMLCanvasElement>()
  const hovered = ref(false)

  const bpConfig = computed(() => section()[vp.mode as keyof Section] as BreakpointSize)

  const gridStyle = computed(() => {
    const { cols, rows, gap } = bpConfig.value
    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: `${gap}px`
    }
  })

  function drawGrid() {
    const el = sectionRef.value
    const canvas = canvasRef.value
    if (!el || !canvas) return

    const { cols, rows, gap } = bpConfig.value
    const rect = el.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const cellW = (rect.width - (cols - 1) * gap) / cols
    const cellH = (rect.height - (rows - 1) * gap) / rows

    ctx.fillStyle = 'rgba(128, 128, 128, 0.05)'
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(c * (cellW + gap), r * (cellH + gap), cellW, cellH)
      }
    }
  }

  const shouldShow = computed(() => vp.showGrids || hovered.value)

  let ro: ResizeObserver | null = null

  onMounted(() => {
    ro = new ResizeObserver(() => {
      if (shouldShow.value) drawGrid()
    })
    if (sectionRef.value) ro.observe(sectionRef.value)
  })

  onUnmounted(() => ro?.disconnect())

  watch([bpConfig, shouldShow], () => {
    if (shouldShow.value) nextTick(drawGrid)
  })

  return { sectionRef, canvasRef, bpConfig, gridStyle, hovered, shouldShow, drawGrid }
}
