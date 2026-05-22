import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import { siteStore } from '@/stores/siteStore'
import type { ApiError } from '@/types/auth'

const apiRoute = import.meta.env.VITE_END_POINT

export const useApi = async (url: string, options?: FetchOptions) => {
  const st = siteStore()

  const token = localStorage.getItem('auth_token')

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers
  }

  const opts = options ? (({ headers, ...rest }) => rest)(options) : null
  const baseURL = !options?.baseURL ? apiRoute : options.baseURL

  try {
    const res = await ofetch(url, {
      async onResponseError({ response }) {
        if (response.status === 401 && st) st.REACT401++
      },
      baseURL,
      credentials: 'include',
      headers,
      ...opts
    })
    return res
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      !('response' in error)
    ) {
      const networkError: { data: ApiError } = {
        data: { error: 'Servidor no disponible', code: 503 }
      }
      throw networkError
    }
    throw error
  }
}
