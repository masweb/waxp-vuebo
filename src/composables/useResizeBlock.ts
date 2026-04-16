import interact from 'interactjs'
import type { InteractEvent } from '@interactjs/core/InteractEvent'

export const useResizeBlock = (
  blockEl: Ref<HTMLElement | undefined>,
  block: () => Block,
  section: () => Section,
) => {
  const dr = drawingStore()
  const vp = viewportStore()
  const { pixelToGrid, pushDown, ensureRows, trimRows } = useGridConversion()

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

  const calcResize = (rect: { left: number; right: number; top: number; bottom: number }) => {
    if (!sectionElement || !sectionRect) return null
    const config = getBpConfig()
    const cellHalf = getCellHalf()

    const startX = rect.left - sectionRect.left + cellHalf
    const startY = rect.top - sectionRect.top + cellHalf
    const endX = rect.right - sectionRect.left - cellHalf
    const endY = rect.bottom - sectionRect.top - cellHalf

    const startGrid = pixelToGrid(startX, startY, sectionElement, config, true)
    const endGrid = pixelToGrid(endX, endY, sectionElement, config, true)

    const newW = Math.max(1, Math.abs(endGrid.col - startGrid.col) + 1)
    const newH = Math.max(1, Math.abs(endGrid.row - startGrid.row) + 1)
    const newX = Math.max(1, Math.min(startGrid.col, config.cols - newW + 1))
    const newY = Math.max(1, startGrid.row)

    return { x: newX, y: newY, w: newW, h: newH }
  }

  const applyLive = (event: InteractEvent) => {
    const coords = calcResize(event.rect)
    if (!coords) return

    const b = block()
    const modeKey = MODE_KEY[vp.mode]
    b[modeKey] = { ...coords }

    const config = getBpConfig()
    const needed = coords.y + coords.h
    if (needed > config.rows) config.rows = needed

    dr.setMoveShadow(coords, section().id)
    throttleTimer = null
  }

  const onStart = (event: InteractEvent) => {
    sectionElement = (event.target as HTMLElement).closest('.section') as HTMLElement
    if (!sectionElement) { cancelled = true; return }

    sectionRect = sectionElement.getBoundingClientRect()
    originalCoords = { ...block()[MODE_KEY[vp.mode]] }
    cancelled = false

    ;(event.target as HTMLElement).classList.add('block--resizing')
    dr.setMoveShadow({ ...originalCoords }, section().id)
  }

  const onMove = (event: InteractEvent) => {
    if (cancelled) return
    if (throttleTimer) return
    throttleTimer = window.requestAnimationFrame(() => applyLive(event))
  }

  const onEnd = (event: InteractEvent) => {
    if (cancelled || !sectionElement || !sectionRect || !originalCoords) {
      resetState(event)
      return
    }

    const coords = calcResize(event.rect)
    if (!coords) { resetState(event); return }

    const b = block()
    const sec = section()
    const modeKey = MODE_KEY[vp.mode]
    b[modeKey] = coords

    pushDown(sec.blocks, modeKey, coords, b.id)
    ensureRows(sec, vp.mode)

    trimRows(sec)
    resetState(event)
  }

  const resetState = (event?: InteractEvent) => {
    if (event) (event.target as HTMLElement).classList.remove('block--resizing')
    if (blockEl.value) blockEl.value.classList.remove('block--resizing')
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
      .resizable({
        edges: { right: true, bottom: true },
        allowFrom: '.blockui.resize',
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 1, height: 1 },
          }),
        ],
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
