export const useBlockBase = (
  block: () => Block,
  section: () => Section
) => {
  const ps = pageStore()
  const hs = historyStore()
  const stt = settingsStore()

  const blockRef = ref<HTMLElement>()
  const { blockStyle } = useBlockGrid(block)

  useMoveBlock(blockRef, block, section)
  useResizeBlock(blockRef, block, section)

  const deleteBlock = () => {
    hs.snapshot()
    const sec = section()
    const idx = sec.blocks.findIndex(b => b.id === block().id)
    if (idx !== -1) sec.blocks.splice(idx, 1)
    if (sec.blocks.length > 0) {
      const { trimRows } = useGridConversion()
      trimRows(sec)
    }
    ps.setActiveBlock(null)
  }

  const blockSettings = () => {
    ps.setActiveBlock(block())
    stt.setSetting('BlockSettings')
  }

  return { blockRef, blockStyle, deleteBlock, blockSettings }
}
