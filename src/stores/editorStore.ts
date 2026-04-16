export type EditorMode = 'draw' | 'edit'

export const editorStore = defineStore('editor', () => {
  const mode = ref<EditorMode>('draw')

  const toggleMode = () => {
    mode.value = mode.value === 'draw' ? 'edit' : 'draw'
  }

  return { mode, toggleMode }
})
