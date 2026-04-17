export const drawingStore = defineStore('drawing', () => {
  const isDrawing = ref(false)
  const activeSectionId = ref<number | null>(null)
  const coords = ref<BlockCoords | null>(null)

  const { calculateGridPosition } = useGridConversion()

  const draw = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sectionEl: HTMLElement,
    config: BreakpointSize,
    sectionId: number,
    allowRowOverflow = false
  ) => {
    coords.value = calculateGridPosition(startX, startY, endX, endY, sectionEl, config, allowRowOverflow)
    isDrawing.value = true
    activeSectionId.value = sectionId
  }

  const setMoveShadow = (newCoords: BlockCoords, sectionId: number) => {
    coords.value = newCoords
    isDrawing.value = true
    activeSectionId.value = sectionId
  }

  const resetDrawing = () => {
    isDrawing.value = false
    activeSectionId.value = null
    coords.value = null
  }

  return { isDrawing, activeSectionId, coords, draw, setMoveShadow, resetDrawing }
})
