export const drawingStore = defineStore('drawing', () => {
  const isDrawing = ref(false)
  const activeSectionId = ref<number | null>(null)
  const coords = ref<BlockCoords | null>(null)

  const { calculateGridPosition } = useGridConversion()

  function draw(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sectionEl: HTMLElement,
    config: BreakpointSize,
    sectionId: number,
    allowRowOverflow = false,
  ) {
    coords.value = calculateGridPosition(startX, startY, endX, endY, sectionEl, config, allowRowOverflow)
    isDrawing.value = true
    activeSectionId.value = sectionId
  }

  function resetDrawing() {
    isDrawing.value = false
    activeSectionId.value = null
    coords.value = null
  }

  return { isDrawing, activeSectionId, coords, draw, resetDrawing }
})
