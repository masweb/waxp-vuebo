import { h } from 'vue'
import { IconSettingsFilled, IconTrashFilled } from '@tabler/icons-vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { useTheme } from './useTheme'

export const useBlockBase = (block: () => Block, section: () => Section) => {
  const ps = pageStore()
  const hs = historyStore()
  const stt = settingsStore()
  const { isDark, effectiveTheme } = useTheme()

  const blockRef = ref<HTMLElement>()
  const { blockStyle, backgroundStyle, textStyle } = useBlockGrid(block, section)

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

  const onContextMenu = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.blockui')) return
    e.preventDefault()
    const theme = effectiveTheme.value === 'dark' ? 'dark' : 'default'
    ContextMenu.showContextMenu({
      x: e.x,
      y: e.y,
      theme,
      items: [
        {
          label: 'Configurar',
          icon: h(IconSettingsFilled, { size: 20 }),
          onClick: () => blockSettings()
        },
        {
          label: 'Eliminar',
          icon: h(IconTrashFilled, { size: 20 }),
          onClick: () => deleteBlock()
        }
      ]
    })
  }

  return { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu }
}
