export type EditorMode = 'draw' | 'edit'
export type BlockType = 'Text' | 'Image' | 'Space' | 'DarkMode' | 'LanguageSwitcher' | 'Button' | 'Menu'

export const editorStore = defineStore('editor', () => {
  const mode = ref<EditorMode>('draw')
  const showModalNewBlock = ref(false)
  const pendingBlockTypeResolve = ref<((type: BlockType) => void) | null>(null)

  const toggleMode = () => {
    mode.value = mode.value === 'draw' ? 'edit' : 'draw'
  }

  const requestBlockType = (): Promise<BlockType> => {
    showModalNewBlock.value = true
    return new Promise<BlockType>(resolve => {
      pendingBlockTypeResolve.value = resolve
    })
  }

  const selectBlockType = (type: BlockType) => {
    showModalNewBlock.value = false
    pendingBlockTypeResolve.value?.(type)
    pendingBlockTypeResolve.value = null
  }

  return { mode, toggleMode, showModalNewBlock, requestBlockType, selectBlockType }
})
