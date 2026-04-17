import interact from 'interactjs'
import type { InteractEvent } from '@interactjs/core/InteractEvent'

export const useMoveBlock = (
  blockEl: Ref<HTMLElement | undefined>,
  block: () => Block,
  section: () => Section,
) => {
  const dr = drawingStore()
  const vp = viewportStore()
  const { pixelToGrid, pushDown, ensureRows, trimRows } = useGridConversion()
  const hs = historyStore()

  const position = { x: 0, y: 0 }

  let sectionElement: HTMLElement | null = null
  let sectionRect: DOMRect | null = null
  let originalCoords: BlockCoords | null = null
  let interactable: ReturnType<typeof interact> | null = null
  let throttleTimer: number | null = null
  let cancelled = false

  const getBpConfig = () => section()[vp.mode] as BreakpointSize

  const getCellHalf = () => {
    const config = getBpConfig()
    return (sectionRect!.width - config.gap * (config.cols - 1)) / config.cols / 2
  }

  const calcShadow = () => {
    if (!sectionElement || !sectionRect || !blockEl.value || !originalCoords) return
    const config = getBpConfig()
    const blockRect = blockEl.value.getBoundingClientRect()
    const cellHalf = getCellHalf()
    const relX = blockRect.left - sectionRect.left + cellHalf
    const relY = blockRect.top - sectionRect.top + cellHalf

    const gridPos = pixelToGrid(relX, relY, sectionElement, config, true)
    const maxX = Math.max(1, config.cols - originalCoords.w + 1)
    const newX = Math.max(1, Math.min(gridPos.col, maxX))
    const newY = Math.max(1, gridPos.row)

    dr.setMoveShadow({ x: newX, y: newY, w: originalCoords.w, h: originalCoords.h }, section().id)

    const needed = newY + originalCoords.h
    if (needed > config.rows) config.rows = needed

    throttleTimer = null
  }

  const onStart = (event: InteractEvent) => {
    sectionElement = (event.target as HTMLElement).closest('.section') as HTMLElement
    if (!sectionElement) { cancelled = true; return }

    sectionRect = sectionElement.getBoundingClientRect()
    originalCoords = { ...block()[MODE_KEY[vp.mode]] }
    cancelled = false

    ;(event.target as HTMLElement).classList.add('block--moving')
    dr.setMoveShadow({ ...originalCoords }, section().id)
  }

  const onMove = (event: InteractEvent) => {
    if (cancelled) return
    position.x += event.dx
    position.y += event.dy
    ;(event.target as HTMLElement).style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`

    if (throttleTimer) return
    throttleTimer = window.requestAnimationFrame(calcShadow)
  }

  const onEnd = (event: InteractEvent) => {
    if (cancelled || !sectionElement || !sectionRect || !blockEl.value || !originalCoords) {
      resetState()
      return
    }

    hs.snapshot()

    const config = getBpConfig()
    const blockRect = blockEl.value.getBoundingClientRect()
    const cellHalf = getCellHalf()
    const relX = blockRect.left - sectionRect.left + cellHalf
    const relY = blockRect.top - sectionRect.top + cellHalf
    const gridPos = pixelToGrid(relX, relY, sectionElement, config, true)

    const maxX = Math.max(1, config.cols - originalCoords.w + 1)
    const newCoords: BlockCoords = {
      x: Math.max(1, Math.min(gridPos.col, maxX)),
      y: Math.max(1, gridPos.row),
      w: originalCoords.w,
      h: originalCoords.h,
    }

    const b = block()
    const sec = section()
    const modeKey = MODE_KEY[vp.mode]
    b[modeKey] = newCoords

    pushDown(sec.blocks, modeKey, newCoords, b.id)
    ensureRows(sec, vp.mode)

    trimRows(sec)

    ;(event.target as HTMLElement).style.transform = ''
    ;(event.target as HTMLElement).classList.remove('block--moving')
    resetState()
  }

  const resetState = () => {
    if (blockEl.value) blockEl.value.classList.remove('block--moving')
    position.x = 0
    position.y = 0
    sectionElement = null
    sectionRect = null
    originalCoords = null
    throttleTimer = null
    cancelled = false
    dr.resetDrawing()
  }

  onMounted(() => {
    if (!blockEl.value) return
    interactable = interact(blockEl.value)
    interactable
      .draggable({
        allowFrom: '.blockui.move',
        listeners: {
          start: onStart,
          move: onMove,
          end: onEnd,
        },
      })
      .styleCursor(false)
  })

  onUnmounted(() => {
    interactable?.unset()
    if (throttleTimer) cancelAnimationFrame(throttleTimer)
  })
}
