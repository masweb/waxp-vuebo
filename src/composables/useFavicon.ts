import { watch } from 'vue'

const DEFAULT_FAVICON = '/favicon.svg'

function setFavicon(url: string | undefined) {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
  const href = url || DEFAULT_FAVICON

  if (link) {
    link.href = href
    link.removeAttribute('type')
    return
  }

  const el = document.createElement('link')
  el.rel = 'icon'
  el.href = href
  document.head.appendChild(el)
}

export function useFavicon() {
  const st = siteStore()
  const apiBase = import.meta.env.VITE_END_POINT

  watch(
    () => st.site?.options?.faviconUrl,
    raw => setFavicon(raw ? `${apiBase}${raw}` : undefined),
    { immediate: true }
  )
}
