import type { ApiError } from '@/types/auth'

export const errorsStore = defineStore('errors', () => {
  const errors = ref<ApiError[]>([])
  const addError = (apiError: ApiError): void => {
    const id = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const newError: StoredError = {
      id,
      error: apiError.error,
      code: apiError.code
    }
    errors.value.push(newError)
    setTimeout(() => {
      removeError(id)
    }, 3000)
  }
  const removeError = (idToRemove: string): void => {
    errors.value = errors.value.filter(error => error.id !== idToRemove)
  }
  return {
    errors,
    addError
  }
})
