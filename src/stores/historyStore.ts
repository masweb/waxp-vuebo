export const historyStore = defineStore('history', () => {
  const actions = ref<Action[]>([])

  return {
    actions
  }
})

export interface Action {
  action: string
  redo: string
}
